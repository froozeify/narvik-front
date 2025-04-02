export default defineAppConfig({
  toaster: {
    position: 'top-right' as const
  },

	ui: {
    colors: {
      primary: 'blue',
      neutral: 'slate',
      orange: 'orange',
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    },
    card: {
      defaultVariants: {
        variant: 'subtle'
      }
    },


    // TODO: To migrate to nuxt-ui v3
		card: {
			background: 'bg-neutral-50 dark:bg-gray-900'
		},
		table: {
			td: {
				padding: 'py-2'
			}
		}
	}
})
