# Most Recently Published Viewer

## Overview

The code contained in this repository is an example of how you would go about building a webapp to display the most recently published imagery from the Astro Digital platform and displaying some associated metadata.

This example illustrates interacting with several Astro Digital API endpoints and how to use the returned data. In particular, the following endpoints are used:

- [`/scenes`](http://docs.astrodigital.com/v1.0/docs/scenes) is used to retrieve a list of the most recently published scenes.
- [`/methods`](http://docs.astrodigital.com/v1.0/docs/methods) is used to list all the processing methods available with the platform.
- [`/satellites`](http://docs.astrodigital.com/v1.0/docs/satellites) is used to retrieve a list of all the satellites supported by the platform.
- [`/search`](http://docs.astrodigital.com/v1.0/docs/search) is being used to determine the scene center and bounding box for a published image.

## Running

The webapp is written in only HTML, CSS and JS and does not require the installation of any special frameworks. As such, you can run it with any static server setup you want, see [here](https://gist.github.com/willurd/5720255) for a whole bunch of static server one-liners examples that will help you get up and running.

