import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'node:url';
import type { User, InsertUser } from '../shared/schema';

// 获取当前文件的路径和目录 (ES Module 方式)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 使用 path.resolve 确保得到绝对路径
const dataDir = path.resolve(__dirname, '../data'); // 指向项目根目录下的 data (之前是 ../../data，根据 auth.ts 和 file-data-store.ts 都在 server/ 下，应该是 ../data)
const usersFilePath = path.join(dataDir, 'users.json');
console.log(`[UserDataStore] Resolved filename: ${__filename}`);
console.log(`[UserDataStore] Resolved dirname: ${__dirname}`);
console.log(`[UserDataStore] Data directory path: ${dataDir}`);
console.log(`[UserDataStore] Users file path: ${usersFilePath}`);

// 确保 data 目录存在
if (!fs.existsSync(dataDir)) {
  console.log(`[UserDataStore] Creating data directory: ${dataDir}`);
  fs.mkdirSync(dataDir, { recursive: true });
}

// 确保 users.json 文件存在
if (!fs.existsSync(usersFilePath)) {
  console.log(`[UserDataStore] Creating empty users file: ${usersFilePath}`);
  fs.writeFileSync(usersFilePath, '[]', 'utf-8');
}

// 读取用户数据
function readUsers(): User[] {
  console.log(`[UserDataStore] Attempting to read users from: ${usersFilePath}`);
  try {
    // Check if file exists before reading
    if (!fs.existsSync(usersFilePath)) {
        console.log(`[UserDataStore] Users file does not exist at path: ${usersFilePath}. Returning empty array.`);
        return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf-8');
    console.log(`[UserDataStore] Raw data read from file: ${data.substring(0, 100)}...`); // Log first 100 chars
    // Handle empty file case explicitly
    if (data.trim() === '') {
        console.log(`[UserDataStore] Users file is empty. Returning empty array.`);
        return [];
    }
    const users = JSON.parse(data) as any[]; // Parse as any first
    console.log(`[UserDataStore] Parsed ${users.length} users.`);
    // Convert date strings back to Date objects
    const mappedUsers = users.map(user => ({
      ...user,
      // Ensure joinedDate exists and is valid before converting
      joinedDate: user.joinedDate && !isNaN(new Date(user.joinedDate).getTime()) ? new Date(user.joinedDate) : new Date(),
    })) as User[];
    console.log(`[UserDataStore] Successfully read and mapped ${mappedUsers.length} users.`);
    return mappedUsers;
  } catch (error) {
    console.error(`[UserDataStore] Error reading users file from ${usersFilePath}:`, error);
    if (error instanceof SyntaxError) {
        console.error('[UserDataStore] Users JSON file appears corrupted.');
         // Optional: Backup corrupted file
        // try { 
        //     fs.copyFileSync(usersFilePath, `${usersFilePath}.corrupted-${Date.now()}`);
        //     fs.writeFileSync(usersFilePath, '[]', 'utf-8'); // Reset to empty
        // } catch (backupError) { console.error("Failed to backup/reset corrupted file:", backupError); }
    }
    return [];
  }
}

// 写入用户数据
function writeUsers(users: User[]): void {
  console.log(`[UserDataStore] Attempting to write ${users.length} users to: ${usersFilePath}`);
  try {
    const dataToWrite = JSON.stringify(users, null, 2);
    console.log(`[UserDataStore] Data to write: ${dataToWrite.substring(0, 100)}...`); // Log first 100 chars
    fs.writeFileSync(usersFilePath, dataToWrite, 'utf-8');
    console.log(`[UserDataStore] Successfully wrote ${users.length} users to ${usersFilePath}`);
  } catch (error) {
    console.error(`[UserDataStore] Error writing users file to ${usersFilePath}:`, error);
    throw new Error(`Failed to write users file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// 查找用户（按用户名或邮箱）
function findUserByUsernameOrEmail(identifier: string): User | undefined {
  const users = readUsers();
  return users.find(user => user.username === identifier || user.email === identifier);
}

// 查找用户（按 ID）
function findUserById(id: number): User | undefined {
    const users = readUsers();
    return users.find(user => user.id === id);
}

// 添加用户
async function addUser(userData: Omit<InsertUser, 'password'> & { passwordPlainText: string }): Promise<User> {
  const users = readUsers();

  // 检查用户名或邮箱是否已存在
  if (users.some(user => user.username === userData.username || user.email === userData.email)) {
    throw new Error('Username or email already exists.');
  }

  // 生成新 ID (更健壮的方式)
  const newId = users.reduce((maxId, user) => Math.max(user.id, maxId), 0) + 1;

  // 哈希密码
  const hashedPassword = await bcrypt.hash(userData.passwordPlainText, 10);

  const newUser: User = {
    id: newId,
    username: userData.username,
    password: hashedPassword, // Store the hashed password
    displayName: userData.displayName,
    email: userData.email,
    profileImage: userData.profileImage ?? null,
    joinedDate: new Date(), // Use current date for new user
    adhd_profile: userData.adhd_profile ?? null,
    identityTags: userData.identityTags ?? null,
    isConsultant: userData.isConsultant ?? false,
    consultantTitle: userData.consultantTitle ?? null,
    consultantBio: userData.consultantBio ?? null,
    consultantVerified: userData.consultantVerified ?? false,
    points: userData.points ?? 0,
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export const userDataStore = {
  readUsers,
  writeUsers,
  findUserByUsernameOrEmail,
  findUserById,
  addUser,
}; 