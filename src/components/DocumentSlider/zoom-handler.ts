import { useWindowResize, useZoom } from '../../core/hooks';
import { isTouchDevice } from '../../core/utils';
import { type PdfParsedDocument } from '../../pdf-reader';

export const MIN_ZOOM_LEVEL = 1;
export const MAX_ZOOM_LEVEL = 3.2;

export const zoomHandler = (pdfRef: PdfParsedDocument) => {
   const ACTIVE_ZOOM_CLASS = 'active-zoom';
   const ZOOM_STEP = 0.6;
   let zoomLevel = MIN_ZOOM_LEVEL;

   let mouseIsDown = false;

   let activeElement: HTMLCanvasElement | null = null;
   const mouseDownCords = {
      x: 0,
      y: 0,
   };
   const elementCoords = {
      x: 0,
      y: 0,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
   };

   const mapTouchCoords = (e): { x: number; y: number } => {
      if ('x' in e && 'y' in e) {
         return { x: e.x, y: e.y };
      }
      if ('targetTouches' in e && e.targetTouches[0]) {
         return {
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
         };
      }
      return { x: 0, y: 0 };
   };

   function updateElementCoords(element: HTMLCanvasElement) {
      const parentRect = element.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      const currentRect = element.getBoundingClientRect();
      elementCoords.x = currentRect.left - parentRect.left;
      elementCoords.y = currentRect.top - parentRect.top;
      elementCoords.maxX = -1 * (currentRect.width - parentRect.width);
      elementCoords.maxY = -1 * (currentRect.height - parentRect.height);
   }

   function handleTouchDown(e) {
      if (!activeElement) return;
      const coords = mapTouchCoords(e);
      mouseDownCords.x = coords.x;
      mouseDownCords.y = coords.y;
      updateElementCoords(activeElement);
      mouseIsDown = true;
   }

   function handleTouchUp() {
      mouseIsDown = false;
   }

   function handleTouchMove(e) {
      if (mouseIsDown && activeElement) {
         const coords = mapTouchCoords(e);
         const diffX = mouseDownCords.x - coords.x;
         const diffY = mouseDownCords.y - coords.y;
         const nextLeft = elementCoords.x - diffX;
         const nextTop = elementCoords.y - diffY;
         setElementPosition(activeElement, nextLeft, nextTop);
      }
   }

   function setElementPosition(element: HTMLCanvasElement, nextLeft: number, nextTop: number) {
      if (nextLeft > elementCoords.minX) {
         nextLeft = elementCoords.minX;
      }
      if (nextLeft < elementCoords.maxX) {
         nextLeft = elementCoords.maxX;
      }
      if (nextTop > elementCoords.minY) {
         nextTop = elementCoords.minY;
      }
      if (nextTop < elementCoords.maxY) {
         nextTop = elementCoords.maxY;
      }

      if (elementCoords.maxX > 0) {
         // wrapper width > canvas width
         element.style.left = 'initial';
      } else {
         element.style.left = nextLeft + 'px';
      }
      if (elementCoords.maxY > 0) {
         // wrapper height > canvas height
         element.style.top = 'initial';
      } else {
         element.style.top = nextTop + 'px';
      }
   }

   function removeEventListeners(element: HTMLElement | null) {
      if (isTouchDevice()) {
         if (element) {
            element.removeEventListener('touchstart', handleTouchDown);
         }
         document.removeEventListener('touchend', handleTouchUp);
         document.removeEventListener('touchmove', handleTouchMove);
      } else {
         if (element) {
            element.removeEventListener('mousedown', handleTouchDown);
         }
         document.removeEventListener('mouseup', handleTouchUp);
         document.removeEventListener('mousemove', handleTouchMove);
      }
   }

   const windowSizeSub = useWindowResize.on(() => {
      if (!activeElement) return;
      updateElementCoords(activeElement);
      const currentRect = activeElement.getBoundingClientRect();
      setElementPosition(activeElement, currentRect.left, currentRect.top);
   });

   function updateCoords(element: HTMLCanvasElement) {
      updateElementCoords(element);
      const currentRect = element.getBoundingClientRect();
      setElementPosition(element, currentRect.left, currentRect.top);
   }

   return {
      isActiveZoom() {
         return zoomLevel > MIN_ZOOM_LEVEL;
      },
      level() {
         return zoomLevel;
      },
      async zoomIn(element: HTMLCanvasElement | null, activeIndex: number, currentRotate: number) {
         if (element && zoomLevel < MAX_ZOOM_LEVEL) {
            zoomLevel += ZOOM_STEP;
            element.classList.add(ACTIVE_ZOOM_CLASS);
            useZoom.emit(true);

            await pdfRef.render(element, activeIndex, currentRotate, zoomLevel);
            updateElementCoords(element);

            if (element === activeElement) return;
            removeEventListeners(element);
            if (isTouchDevice()) {
               element.addEventListener('touchstart', handleTouchDown);
               document.addEventListener('touchend', handleTouchUp);
               document.addEventListener('touchmove', handleTouchMove);
            } else {
               element.addEventListener('mousedown', handleTouchDown);
               document.addEventListener('mouseup', handleTouchUp);
               document.addEventListener('mousemove', handleTouchMove);
            }
         }
         activeElement = element;
      },
      async zoomOut(element: HTMLCanvasElement | null, activeIndex: number, currentRotate: number) {
         activeElement = element;
         if (element && zoomLevel > MIN_ZOOM_LEVEL) {
            zoomLevel -= ZOOM_STEP;
            if (zoomLevel > MIN_ZOOM_LEVEL) {
               await pdfRef.render(element, activeIndex, currentRotate, zoomLevel);
               updateCoords(element);
            }

            if (zoomLevel === MIN_ZOOM_LEVEL) {
               await pdfRef.render(element, activeIndex, currentRotate); // render initial scale
               element.classList.remove(ACTIVE_ZOOM_CLASS);
               useZoom.emit(false);
               activeElement = null;
               removeEventListeners(element);
               element.style.left = 'initial';
               element.style.top = 'initial';
            }
         }
      },
      unsubscribe() {
         removeEventListeners(activeElement);
         windowSizeSub();
      },
      update(element: HTMLCanvasElement) {
         updateCoords(element);
      },
   };
};
