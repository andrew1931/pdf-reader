import { attr, children, classList, elem, fmt, funState, ifElse, style } from 'fundom.js';

export const Toggle = (defaultValue: boolean) => {
   const [getValue, setValue] = funState(defaultValue);
   const [getTransform, setTransform] = funState(0);

   const subscribers: ((value: boolean) => void)[] = [];
   const OFFSET_X = 3;

   const handle = elem(
      'div',
      classList('w-6', 'h-6', 'bg-white', 'rounded-full', 'absolute', 'transition'),
      style({ transform: fmt('translateX({}px)', getTransform) })
   )();

   const toggle = elem(
      'button',
      classList(
         'toggle',
         'rounded-full',
         'h-8',
         'w-16',
         'mx-2',
         'transition',
         'relative',
         'flex',
         'items-center',
         'disable-dbl-tap-zoom'
      ),
      ifElse(getValue)(classList('bg-green-500'))(classList('bg-slate-300')),
      attr({ 'aria-label': 'Toggle button' }),
      children(handle)
   )();

   toggle.onclick = () => {
      setValue(!getValue());
      subscribers.forEach((cb) => cb(getValue()));
      toggle.blur();
   };

   getValue((val) => {
      if (val) {
         setTransform(toggle.clientWidth - handle.clientWidth - OFFSET_X);
      } else {
         setTransform(OFFSET_X);
      }
   });

   setTimeout(() => {
      setValue(defaultValue, { force: true });
   });

   return {
      target: toggle,
      checked(): boolean {
         return getValue();
      },
      onChange(cb: (value: boolean) => void) {
         subscribers.push(cb);
      },
      update(val: boolean) {
         setValue(val);
      },
   };
};
