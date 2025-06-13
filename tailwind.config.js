module.exports = {
   content: ['./src/**/*.ts'],
   theme: {
      extend: {
         maxWidth: {
            toast: 'calc(100% - 16px)',
         },
         colors: {
            'button-400': '#328dff',
            'button-500': '#127cff',
            'button-600': '#0c68da',
            'light-opacity': 'rgba(0, 0, 0, 0.3)',
            'dark-opacity': 'rgba(0, 0, 0, 0.4)',
         },
         boxShadow: {
            card: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;',
         },
      },
   },
   plugins: [],
};
