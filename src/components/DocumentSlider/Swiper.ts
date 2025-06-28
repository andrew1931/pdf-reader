import { children, classList, elem, style } from 'fundom.js';
import Swiper from 'swiper';
import { Navigation, Keyboard } from 'swiper/modules';

type SwipeSubscriber = (index: number) => void;

export const SWIPER_CLASS = 'swiper';
export const SWIPER_ACTIVE_CLASS = 'swiper-slide-active';
export const SWIPER_BUTTON_PREV_CLASS = 'swiper-button-prev';
export const SWIPER_BUTTON_NEXT_CLASS = 'swiper-button-next';

export const createSwiper = (numberOfSlides: number, initialSlide: number) => {
   const slides: HTMLElement[] = [];

   const Slide = () => {
      return elem(
         'div',
         classList(
            'swiper-slide',
            'h-full',
            'w-full',
            'bg-white',
            'items-center',
            'justify-center',
            'relative'
         ),
         style({ display: 'flex' })
      )();
   };

   for (let i = 0; i < numberOfSlides; i++) {
      slides.push(Slide());
   }
   const wrapper = elem(
      'div',
      classList('swiper-wrapper', 'h-full', 'w-full'),
      children(...slides)
   )();

   const el = elem(
      'div',
      classList(SWIPER_CLASS, 'h-full', 'w-full'),
      children(
         wrapper,
         elem('div', classList(SWIPER_BUTTON_PREV_CLASS)),
         elem('div', classList(SWIPER_BUTTON_NEXT_CLASS))
      )
   )();

   let swipesSub: SwipeSubscriber = () => {};
   const swiper = new Swiper('.' + SWIPER_CLASS, {
      grabCursor: true,
      initialSlide: initialSlide < slides.length ? initialSlide : 0,
      modules: [Navigation, Keyboard],
      keyboard: true,
      navigation: {
         nextEl: '.' + SWIPER_BUTTON_NEXT_CLASS,
         prevEl: '.' + SWIPER_BUTTON_PREV_CLASS,
      },
   });
   swiper.on('slideChange', (e) => {
      swipesSub(e.activeIndex);
   });

   setTimeout(() => swiper.init());

   return {
      target: el,
      current() {
         return swiper.activeIndex;
      },
      slides() {
         return slides;
      },
      onSlideChange(cb: SwipeSubscriber) {
         swipesSub = cb;
      },
      swipeTo(slide: number) {
         swiper.slideTo(slide);
      },
      lockSwipes(lock: boolean) {
         if (lock) {
            swiper.disable();
         } else {
            swiper.enable();
         }
      },
      addSlides(count: number) {
         for (let i = 0; i < count; i++) {
            const slide = Slide();
            slides.push(slide);
            wrapper.appendChild(slide);
         }
         swiper.update();
      },
      removeSlides(from: number) {
         for (let i = from; i < slides.length; i++) {
            wrapper.removeChild(slides[i]);
            slides[i].remove();
         }
         slides.length = from;
         swiper.update();
      },
      clearSlides() {
         for (let i = 0; i < slides.length; i++) {
            slides[i].innerHTML = '';
         }
      },
   };
};
