import Swiper from 'swiper';
import { Navigation, Keyboard } from 'swiper/modules';

type SwipeSubscriber = (index: number) => void;

export const SWIPER_CLASS = 'swiper';
export const SWIPER_ACTIVE_CLASS = 'swiper-slide-active';
export const SWIPER_BUTTON_PREV_CLASS = 'swiper-button-prev';
export const SWIPER_BUTTON_NEXT_CLASS = 'swiper-button-next';

export const createSwiper = (numberOfSlides: number, initialSlide: number) => {
   const el = document.createElement('div');
   el.classList.add(SWIPER_CLASS, 'h-full', 'w-full');
   const wrapper = document.createElement('div');
   wrapper.classList.add('swiper-wrapper', 'h-full', 'w-full');

   const buttonPrev = document.createElement('div');
   buttonPrev.classList.add(SWIPER_BUTTON_PREV_CLASS);
   const buttonNext = document.createElement('div');
   buttonNext.classList.add(SWIPER_BUTTON_NEXT_CLASS);

   const Slide = () => {
      const slide = document.createElement('div');
      slide.classList.add(
         'swiper-slide',
         'h-full',
         'w-full',
         'bg-white',
         'items-center',
         'justify-center',
         'relative'
      );
      slide.style.display = 'flex';
      return slide;
   };

   const slides: HTMLElement[] = [];
   for (let i = 0; i < numberOfSlides; i++) {
      slides.push(Slide());
   }
   wrapper.append(...slides);
   el.append(wrapper, buttonPrev, buttonNext);

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
