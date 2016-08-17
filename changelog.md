# betsol-ng-entity-list changelog

## Version 0.2.1
(16 Aug 2016)

- Added support for value filters


## Version 0.1.1
(21 Nov 2015)

- Implemented infinite scrolling using `inview` module
- Minor fix for criteria and sort params


## Version 0.1.0
(12 Nov 2015)

- Entity field is now generated dynamically inside of internal directive's linking function.
  We can achieve much more flexibility this way in the future
- Introduced dependency for `ngDropdowns` module (not yet supported)


## Version 0.0.6
(11 Nov 2015)

- Entity list service is refactored into a standalone directive (breaking change)
- Default template URL now can be overridden
- Added config service for directive pre-configuration
- Directive emits special initialization event on creation and passes communication object to any interested subscriber.
  Paginator can be accessed that way right now.
- Removed table header and add button, this is out of scope of this directive


## Version 0.0.5
(28 Oct 2015)

- Field content is now extracted in it's own directive for easy wrapping
- Introduced concept of field transformers
- Added support for tooltips
- Skype and E-Mail field types are now fully-supported


## Version 0.0.4
(25 Oct 2015)

- Improved support for date and datetime field types
- Added support for links in fields
- Added support for image field type
- Added support for sorting parameters


## Version 0.0.3
(15 Oct 2015)

- Implemented support for deep entity properties


## Version 0.0.2
(15 Oct 2015)

- Added support for paginator criteria


## Version 0.0.1
(15 Oct 2015)

- Added support for formatters


## Version 0.0.0
(17 Sep 2015)

- Initial release
