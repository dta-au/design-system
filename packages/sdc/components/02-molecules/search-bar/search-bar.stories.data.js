export default {
  args: (theme = 'light') => ({
    theme,
    label: 'Search keywords',
    placeholder: "I'm looking for...",
    button_text: 'Search',
    action: '',
    method: 'get',
    input_name: 'keywords',
    input_value: '',
    modifier_class: '',
    attributes: null,
  }),
};
