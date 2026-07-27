// locutus 3 exports `date` as a named binding and drops the default export that
// drupal-twig-extensions still imports. Bridge the two so the registry package
// works against locutus 3; drop once JohnAlbin/drupal-twig-extensions#63 ships.
export { date as default } from 'locutus/php/datetime/date';
