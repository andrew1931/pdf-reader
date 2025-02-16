import Swiper from "swiper";
import { Navigation, Keyboard, EffectCreative } from "swiper/modules";

type SwipeSubscriber = (index: number) => void;

export const createSwiper = (numberOfSlides: number, initialSlide: number) => {
    const el = document.createElement("div");
    el.classList.add("swiper", "h-full", "w-full");
    const wrapper = document.createElement("div");
    wrapper.classList.add("swiper-wrapper", "h-full", "w-full");

    const buttonPrev = document.createElement("div");
    buttonPrev.classList.add("swiper-button-prev");
    const buttonNext = document.createElement("div");
    buttonNext.classList.add("swiper-button-next");

    const slides: HTMLElement[] = [];
    for (let i = 0; i < numberOfSlides; i++) {
        const slide = document.createElement("div");
        slide.classList.add(
            "swiper-slide",
            "h-full",
            "w-full",
            "bg-white",
            "items-center",
            "justify-center",
            "relative"
        );
        slide.style.display = "flex";
        slides.push(slide);
    }

    wrapper.append(...slides);
    el.append(wrapper, buttonPrev, buttonNext);

    let swipesSub: SwipeSubscriber = () => {};
    let swiper: Swiper | undefined;
    setTimeout(() => {
        swiper = new Swiper(".swiper", {
            autoHeight: true,
            grabCursor: true,
            initialSlide: initialSlide <= numberOfSlides ? initialSlide : 0,
            modules: [
                Navigation,
                Keyboard, 
                EffectCreative 
            ],
            effect: "creative",
            creativeEffect: {
                prev: {
                    shadow: true,
                    translate: [0, 0, -100],
                },
                next: {
                    translate: ["100%", 0, 0],
                },
            },
            keyboard: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            }
        }).init();
        swiper.on("slideChange", (e) => {
            swipesSub(e.activeIndex);
        });
    });

    return {
        target: el,
        slides: slides,
        onSlideChange(cb: SwipeSubscriber) {
            swipesSub = cb;
        },
        swipeTo(slide: number) {
            if (swiper) {
                swiper.slideTo(slide);
            } else {
                console.warn("swiper is not initialized");
            }
        },
        lockSwipes(lock: boolean) {
            if (swiper) {
                if (lock) {
                    swiper.disable();
                } else {
                    swiper.enable();
                }
            } else {
                console.warn("swiper is not initialized");
            }
        }
    };
};