import DogImageUploader from './utils/dogImageUploader';
import * as readline from 'readline';

async function getUserInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const uploader = new DogImageUploader();
  
  const breed = (await getUserInput('Enter the dog breed you want to upload: ')).toLowerCase();
  const basePath = `/dogs/${breed}`;

  try {
    await uploader.uploadBreedImages(breed, basePath, true);
    console.log(`${breed} images uploaded successfully!`);
  } catch (error) {
    console.error('Error uploading images:', error);
  }
}

main();
