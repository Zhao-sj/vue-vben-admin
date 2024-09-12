export default {
  '**/!public/**/*.{js,jsx,ts,tsx}': [
    'prettier --cache --ignore-unknown  --write',
    'eslint --cache --fix',
  ],
  '**/!public/**/*.{scss,less,styl,html,vue,css}': [
    'prettier --cache --ignore-unknown --write',
    'stylelint --fix --allow-empty-input',
  ],
  '**/!public/**/*.md': ['prettier --cache --ignore-unknown --write'],
  '**/!public/**/*.vue': [
    'prettier --write',
    'eslint --cache --fix',
    'stylelint --fix --allow-empty-input',
  ],
  '**/!public/**/{!(package)*.json,*.code-snippets,.!(browserslist)*rc}': [
    'prettier --cache --write--parser json',
  ],
  'package.json': ['prettier --cache --write'],
};
