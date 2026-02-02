import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '../../backups');

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export const performBackup = async () => {
  console.log('[BACKUP] Starting backup process...');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.zip`;
  const filePath = path.join(BACKUP_DIR, filename);

  try {
    // 1. DUMP DATABASES
    // Postgres
    const pgDumpCmd = `PGPASSWORD="${process.env.PG_PASS || 'password'}" pg_dump -h ${process.env.PG_HOST || 'localhost'} -U ${process.env.PG_USER || 'user'} -d ${process.env.PG_DB || 'database'} -f ${path.join(BACKUP_DIR, 'pg_dump.sql')}`;

    // Mongo
    const mongoDumpCmd = `mongodump --uri="${process.env.MONGO_URL}" --archive=${path.join(BACKUP_DIR, 'mongo_dump.archive')}`;

    console.log('[BACKUP] Dumping PostgreSQL...');
    await execPromise(pgDumpCmd).catch(e => console.error('PG Dump Warning:', e.message)); // Warn but continue

    console.log('[BACKUP] Dumping MongoDB...');
    await execPromise(mongoDumpCmd).catch(e => console.error('Mongo Dump Warning:', e.message));

    // 2. ZIP FILES
    console.log('[BACKUP] Zipping files...');
    await zipFiles(filePath, [
        path.join(BACKUP_DIR, 'pg_dump.sql'),
        path.join(BACKUP_DIR, 'mongo_dump.archive')
    ]);

    // 3. UPLOAD TO DRIVE
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_DRIVE_FOLDER_ID) {
        console.log('[BACKUP] Uploading to Google Drive...');
        const fileId = await uploadToDrive(filePath, filename);
        console.log(`[BACKUP] Success! Drive File ID: ${fileId}`);
    } else {
        console.log('[BACKUP] Skipped Drive Upload (Missing Credentials)');
    }

    // 4. CLEANUP
    // Remove temp dumps, keep zip for a while or remove it too
    if (fs.existsSync(path.join(BACKUP_DIR, 'pg_dump.sql'))) fs.unlinkSync(path.join(BACKUP_DIR, 'pg_dump.sql'));
    if (fs.existsSync(path.join(BACKUP_DIR, 'mongo_dump.archive'))) fs.unlinkSync(path.join(BACKUP_DIR, 'mongo_dump.archive'));
    // Optionally remove the zip after upload to save space
    // fs.unlinkSync(filePath);

    return { success: true, filename };

  } catch (error) {
    console.error('[BACKUP] Failed:', error);
    return { success: false, error: error.message };
  }
};

// --- HELPERS ---

const execPromise = (cmd) => new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            // Check if it's just a warning or real error
            // pg_dump might return error code on warnings
            reject(error);
        } else {
            resolve(stdout);
        }
    });
});

const zipFiles = (outPath, sourceFiles) => new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    sourceFiles.forEach(file => {
        if (fs.existsSync(file)) {
            archive.file(file, { name: path.basename(file) });
        }
    });

    archive.finalize();
});

const uploadToDrive = async (filePath, fileName) => {
    // Decode Base64 JSON or load from file path
    // Env var GOOGLE_SERVICE_ACCOUNT_JSON can be the raw JSON string or path
    let auth;

    // Check if it's a path or JSON content
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON.startsWith('{')) {
         // Create a temp file for credentials because googleapis likes file paths or keys
         const credsPath = path.join(__dirname, '../../google-creds.json');
         fs.writeFileSync(credsPath, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
         auth = new google.auth.GoogleAuth({
            keyFile: credsPath,
            scopes: SCOPES,
         });
    } else {
        auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
            scopes: SCOPES,
        });
    }

    const service = google.drive({ version: 'v3', auth });

    const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
    };

    const media = {
        mimeType: 'application/zip',
        body: fs.createReadStream(filePath)
    };

    const file = await service.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id'
    });

    return file.data.id;
};
