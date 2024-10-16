import DogImageUploader from '../utils/dogImageUploader';
import YandexDiskResources from '../api/yandex-disk/yandexDiskResources';
import YandexDiskClient from '../api/yandex-disk/yandexDiskClient';

describe('DogImageUploader', () => {
  const yandexDiskClient = new YandexDiskClient();
  const yandexDiskResources = new YandexDiskResources(yandexDiskClient.getClient());
  const uploader = new DogImageUploader();
  
  const testDirectories = ['/dogs/doberman', '/dogs/spaniel'];

  beforeAll(async () => {
    await Promise.all(testDirectories.map(directory => 
      yandexDiskResources.removeDirectory({ path: directory, permanently: true }, [404])
    ));
  });

  afterAll(async () => {
    await Promise.all(testDirectories.map(directory => 
      yandexDiskResources.removeDirectory({ path: directory, permanently: true })
    ));
  });

  test.each([
    ['doberman', ['disk:/dogs/doberman/doberman.jpg'], testDirectories[0]],
    ['spaniel', [
      'disk:/dogs/spaniel/spaniel.jpg',
      'disk:/dogs/spaniel/spaniel_blenheim.jpg',
      'disk:/dogs/spaniel/spaniel_brittany.jpg',
      'disk:/dogs/spaniel/spaniel_cocker.jpg',
      'disk:/dogs/spaniel/spaniel_irish.jpg',
      'disk:/dogs/spaniel/spaniel_japanese.jpg',
      'disk:/dogs/spaniel/spaniel_sussex.jpg',
      'disk:/dogs/spaniel/spaniel_welsh.jpg'
    ], testDirectories[1]] 
  ])('should upload images for breed: %s and check directory size', async (breed, expectedFiles, path) => {
    await uploader.uploadBreedImages(breed, path, true);

    const directoryContents = await yandexDiskResources.getDirectoryContents({ path: path });
    
    expect(directoryContents._embedded.items.length).toBe(expectedFiles.length);
    
    const actualFileNames = directoryContents._embedded.items.map((item: { path: string }) => item.path);
    expect(actualFileNames.sort()).toEqual(expectedFiles.sort());
  });
});
