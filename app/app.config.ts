export default defineAppConfig({
  toaster: {
    position: 'top-right' as const
  },

  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
      orange: 'orange',
      red: 'red',
      green: 'green',
      yellow: 'yellow',
      purple: 'purple'
    },

    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      },
      slots: {
        base: 'cursor-pointer'
      }
    },
    card: {
      defaultVariants: {
        variant: 'subtle'
      }
    },
    input: {
      slots: {
        root: 'w-full'
      }
    },
    table: {
      slots: {
        td: 'py-2'
      }
    },
  }
})
