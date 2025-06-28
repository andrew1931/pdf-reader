import { attr, children, classList, elem, fmt, funState, on, style, txt } from 'fundom.js';

export const Range = (max: number, current: number) => {
   const [getLabelText, setLabelText] = funState('');
   const [getWidth, setWidth] = funState(0);

   const rangeVisible = elem(
      'div',
      classList('absolute', 'z-0', 'w-full', 'h-full', 'rounded-md', 'overflow-hidden'),
      children(
         elem('div', classList('w-full', 'h-full', 'bg-slate-500')),
         elem(
            'div',
            classList('h-full', 'bg-blue-500', 'absolute', 'left-0', 'top-0'),
            style({ width: fmt('{}%', getWidth) })
         )
      )
   )();

   const rangeHidden = elem(
      'input',
      attr({
         type: 'range',
         step: 'any',
         min: '0',
         max: String(max),
         value: String(current),
      }),
      classList(
         'opacity-0',
         'z-10',
         'absolute',
         'w-full',
         'cursor-pointer',
         'absolute',
         'left-0',
         'h-full'
      ),
      on('input', mapInputValueToVisibleRange)
   )();

   const labelEl = elem(
      'div',
      classList('disable-dbl-tap-zoom', 'flex', 'flex-col', 'justify-center', 'items-center'),
      children(
         elem(
            'span',
            classList('font-medium', 'text-xs', 'text-white', 'absolute', 'z-10'),
            txt(getLabelText)
         ),
         elem('div', classList('relative', 'w-52', 'h-[30px]'), children(rangeHidden, rangeVisible))
      )
   )();

   function mapInputValueToVisibleRange() {
      setLabelText(rangeValue() + ' out of ' + max);
      setWidth((Number(rangeHidden.value) * 100) / max);
   }

   mapInputValueToVisibleRange();

   function rangeValue(): number {
      return Math.floor(Number(rangeHidden.value)) || 1; // prevent 0
   }

   return {
      target: labelEl,
      onChange(cb: (page: number) => void): void {
         rangeHidden.onchange = () => {
            rangeHidden.blur(); // if focus stays - left/right keys conflict with input accessibility left/right
            const floorValue = rangeValue();
            rangeHidden.value = String(floorValue);
            mapInputValueToVisibleRange();
            cb(floorValue);
         };
      },
      update(val: number) {
         if (val !== Math.floor(+rangeHidden.value)) {
            rangeHidden.value = String(val);
            mapInputValueToVisibleRange();
         }
      },
      disable() {
         rangeHidden.disabled = true;
      },
      enable() {
         rangeHidden.disabled = false;
      },
   };
};
