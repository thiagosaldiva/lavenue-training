import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const args = process.argv.slice(2);
let dirsToScan = [];

if (args.length > 0) {
  dirsToScan = [path.resolve(args[0])];
} else {
  const publicDir = path.resolve('client/public');
  dirsToScan = [publicDir, path.join(publicDir, 'uploads')];
}

async function convertImages() {
  let convertedCount = 0;
  
  for (const dir of dirsToScan) {
    if (!fs.existsSync(dir)) continue;
    
    console.log(`\nBuscando imagens em: ${dir}`);
    const files = fs.readdirSync(dir, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);
      
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.heic', '.heif'].includes(ext)) {
        const fullPath = path.join(dir, file);
        const outPath = path.join(dir, file.replace(new RegExp(`\\${ext}$`, 'i'), '.webp'));
        
        if (fs.existsSync(outPath) && file !== 'hero.jpg' && file !== 'logo.png') {
            continue;
        }
        
        try {
          if (ext === '.heic' || ext === '.heif') {
             console.log(`Extraindo dados originais da Apple de ${file}... (pode levar alguns segundos)`);
             const inputBuffer = fs.readFileSync(fullPath);
             const outputBuffer = await heicConvert({
                buffer: inputBuffer,
                format: 'JPEG',
                quality: 1
             });
             await sharp(outputBuffer).webp({ quality: 80 }).toFile(outPath);
          } else {
             await sharp(fullPath).webp({ quality: 80 }).toFile(outPath);
          }
          console.log(`✅ Convertido: ${file}  ->  ${path.basename(outPath)}`);
          convertedCount++;
        } catch (err) {
          console.error(`❌ Erro ao converter ${file}:`, err.message);
        }
      }
    }
  }
  
  console.log(`\n🎉 Pronto! Um total de ${convertedCount} imagens foram convertidas para WebP.`);
}

convertImages();
