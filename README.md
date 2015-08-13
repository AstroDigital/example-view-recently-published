# Most Recently Published Viewer

## Overview

The code contained in this repository is an example of how you would go about building a webapp to display the most recently published imagery from the Astro Digital platform and displaying some associated metadata.

This example illustrates interacting with several Astro Digital API endpoints and how to use the returned data. In particular, the following endpoints are used:

- [`/scenes`](http://docs.astrodigital.com/v1.0/docs/scenes) is used to retrieve a list of the most recently published scenes.
- [`/search`](http://docs.astrodigital.com/v1.0/docs/search) is being used to determine the scene center and bounding box for a published image.

## Running

The webapp is written in only HTML, CSS and JS and does not require the installation of any special frameworks. As such, you can run it with any static server setup you want, see [here](https://gist.github.com/willurd/5720255) for a whole bunch of static server one-liners examples that will help you get up and running.

To successfully view the imagery, you will need to add a valid Mapbox access token at https://github.com/AstroDigital/example-view-recently-published/blob/master/js/main.js#L12. You can see more about how to generate an access token [here](https://www.mapbox.com/help/create-api-access-token/).