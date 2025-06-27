import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { mdi } from 'vuetify/iconsets/mdi';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
});

export default vuetify;
