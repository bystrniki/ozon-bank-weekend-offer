import DogCeoClient from '../api/dog-ceo/dogCeoClient';
import YandexDiskClient from '../api/yandex-disk/yandexDiskClient';
import YandexDiskResources from '../api/yandex-disk/yandexDiskResources';

class DogImageUploader {
  private dogCeoClient: DogCeoClient;
  private yandexDiskResources: YandexDiskResources;

  constructor() {
    this.dogCeoClient = new DogCeoClient();
    const yandexDiskClient = new YandexDiskClient();
    this.yandexDiskResources = new YandexDiskResources(yandexDiskClient.getClient());
  }

  public async uploadBreedImages(breed: string, basePath: string, overwrite: boolean): Promise<void> {
    try {
      await this.uploadRandomDogImage(breed, `${basePath}/${breed}.jpg`, overwrite);
      const subBreeds = await this.dogCeoClient.getSubBreeds(breed);
      await Promise.all(subBreeds.map(subBreed => 
        this.uploadRandomDogImage(`${breed}/${subBreed}`, `${basePath}/${breed}_${subBreed}.jpg`, overwrite)
      ));
      console.log(`[DogImageUploader.uploadBreedImages] Successfully uploaded images for ${breed} and its sub-breeds to Yandex Disk`);
    } catch (error) {
      console.error(`[DogImageUploader.uploadBreedImages] Error uploading images for ${breed}: ${error}`);
      throw error;
    }
  }

  private async uploadRandomDogImage(breed: string, path: string, overwrite: boolean): Promise<void> {
    try {
      const imageUrl = await this.dogCeoClient.getRandomImage(breed);
      await this.yandexDiskResources.uploadResource({ path, url: imageUrl, overwrite: true });
      console.log(`[DogImageUploader.uploadRandomDogImage] Successfully uploaded a random ${breed} image to Yandex Disk at ${path}`);
    } catch (error) {
      console.error(`[DogImageUploader.uploadRandomDogImage] Error uploading random ${breed} image to Yandex Disk: ${error}`);
      throw error;
    }
  }
}

export default DogImageUploader;