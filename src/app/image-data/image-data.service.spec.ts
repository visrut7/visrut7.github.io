import { TestBed } from '@angular/core/testing';
import { ImageDataService } from './image-data.service';

describe('ImageDataService', () => {
  let service: ImageDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getImageData', () => {
    it('should handle image data correctly', (done) => {
      spyOn(document, 'createElement').and.callFake(
        (tagName: string): HTMLElement => {
          if (tagName !== 'canvas') return document.createElement(tagName);

          // Mocked canvas element
          return {
            width: 0,
            height: 0,
            getContext: (): CanvasRenderingContext2D =>
              ({
                drawImage: () => {},
                getImageData: () => new ImageData(2, 2),
                putImageData: () => {},
                canvas: {
                  toDataURL: () =>
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
                },
              } as unknown as CanvasRenderingContext2D),
          } as unknown as HTMLElement;
        }
      );

      // Now when getImageData or getImage is called, it will use the mocked canvas
      // Example for getImageData
      const testImageSrc =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
      service.getImageData(testImageSrc).then((imageData) => {
        expect(imageData).toBeTruthy();
        done();
      });

      // For getImage, you can directly call the method and verify its behavior
      const imageData = new Float32Array([0, 255, 127, 64]);
      const dataURL = service.getImage({ imageData, width: 1, height: 1 });
      expect(dataURL).toBe(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
      );

      // Ensure document.createElement for 'canvas' was called
      expect(document.createElement).toHaveBeenCalledWith('canvas');
    });
  });
});
