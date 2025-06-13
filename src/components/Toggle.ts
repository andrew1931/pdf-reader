export const Toggle = (defaultValue: boolean) => {
   const subscribers: ((value: boolean) => void)[] = [];
   const OFFSET_X = 3;
   const inactiveBg = 'bg-slate-300';
   const activeBg = 'bg-green-500';
   let value = defaultValue;

   const handle = document.createElement('div');
   handle.classList.add('w-6', 'h-6', 'bg-white', 'rounded-full', 'absolute', 'transition');

   const toggle = document.createElement('button');
   toggle.classList.add(
      'toggle',
      'rounded-full',
      inactiveBg,
      'h-8',
      'w-16',
      'mx-2',
      'transition',
      'relative',
      'flex',
      'items-center',
      'disable-dbl-tap-zoom'
   );
   toggle.setAttribute('aria-label', 'Toggle button');
   toggle.append(handle);

   handleCheckedStyle();
   setTimeout(() => {
      if (value) {
         handleCheckedStyle();
      }
   });

   toggle.onclick = () => {
      value = !value;
      handleCheckedStyle();
      subscribers.forEach((cb) => cb(value));
      toggle.blur();
   };

   function handleCheckedStyle() {
      if (value) {
         toggle.classList.add(activeBg);
         toggle.classList.remove(inactiveBg);
         handle.style.transform = `translateX(${toggle.clientWidth - handle.clientWidth - OFFSET_X}px)`;
      } else {
         toggle.classList.remove(activeBg);
         toggle.classList.add(inactiveBg);
         handle.style.transform = `translateX(${OFFSET_X}px)`;
      }
   }

   return {
      target: toggle,
      checked(): boolean {
         return value;
      },
      onChange(cb: (value: boolean) => void) {
         subscribers.push(cb);
      },

      update(val: boolean) {
         value = val;
         handleCheckedStyle();
      },
   };
};
