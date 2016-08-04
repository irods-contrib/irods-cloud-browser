<a name="1.0.5"></a>
# 1.0.5 Gated Gondola (2015-02-14)

## Features

- update bower dependancies

<a name="1.0.4"></a>
# 1.0.4 Good Citizen (2015-01-25)

## Features

- specify main files correctly in bower.json (wiredep compatible)

<a name="1.0.3"></a>
# 1.0.3 Teeming Caravan (2014-04-27)

## Features

- service now provides convenience methods: .info, .danger, .error, .success, .warn(ing)

<a name="1.0.2"></a>
# 1.0.2 Coffee Correction (2013-12-03)

## Features

- message-center.css now in the dist folder
- adding disabled history rather than logging message in console
- removed all other console.log messages

<a name="1.0.1"></a>
# 1.0.1 Convenience Machine (2013-11-05)

## Features

- No longer required to add `<message-center></message-center>` tag to your page
	- If already present, a duplicate is not created. Will be changed in a later version.

<a name="1.0.0"></a>
# 1.0.0 Breakout Sketch (2013-11-01)

## Features

- Broadcast any message with `MessageService.broadcast('This is an awesome message', opts)`
- Options can be set to `{color: 'primary', important:true}`
- Global Message Service Config can be set via `MessageService.config({disabled:false, max:3, timeout:3000})`
