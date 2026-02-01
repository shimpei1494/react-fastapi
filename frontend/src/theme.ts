import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  components: {
    ActionIcon: {
      defaultProps: { variant: 'subtle', color: 'gray' },
    },
    NavLink: {
      defaultProps: { variant: 'light', color: 'blue' },
    },
    Paper: {
      defaultProps: { radius: 'md', p: 'md' },
    },
    ScrollArea: {
      defaultProps: { scrollbarSize: 6 },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
        autosize: true,
        minRows: 1,
        maxRows: 5,
      },
    },
  },
});
