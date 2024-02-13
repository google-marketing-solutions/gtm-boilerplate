# GTM Boilerplate - e-commerce website

## Setup

Welcome to the guided deployment of the e-commerce website. We will deploy the
demo site on [Google Cloud App Engine](https://cloud.google.com/appengine).

## Cloud Project

To start we need to select the Google Cloud Project to deploy the site in.

We'll be using gcloud to deploy solution on Google Cloud, this SDK should be
available directly from your Cloud Shell environment.

<walkthrough-project-setup></walkthrough-project-setup>

Click the Cloud Shell icon below to copy the command to your shell, and then run
it from the shell by pressing Enter/Return. Terraform will pick up the project
name from the environment variable.

```bash
export GOOGLE_CLOUD_PROJECT=<walkthrough-project-id/>
```

## Prepare environment

Google Cloud Project: <walkthrough-project-id/>

Before we deploy the solution let's modify the file that holds the environment
variables the site needs.

Open <walkthrough-editor-open-file filePath="././ui/src/environments/environment.prod.ts">
environment.prod.ts</walkthrough-editor-open-file>

Fill in the GTM Web Container ID and change locale settings accordingly.

Variable             | Description
-------------------- | -----------
currency             | This is the currency used for all products and tagging/conversions
localCode            | This is used to determine the pricing number format.
gtmContainerId       | Paste your GTM Web Container ID here (formatted as GTM-XXXXXX)

After that, let's get the deployment started.

## Deploying

First we need to build the angular code by running:
```bash
cd ui
npm install -g @angular/cli
npm install
ng build
cd ..
```

Then initialise `gcloud`, making sure you're logged in and have an active
account selected. If you've already intialised `gcloud` you can skip this step.
Follow the prompts in the console during the initialisation.
```bash
gcloud init
```

With the next command we'll deploy the website on AppEngine, run the next
command in the console and follow the prompts during the deployment.
```bash
gcloud app deploy
```

Once the deployment is completed you can use the follow command to describe the
newly deployed service, showing you the hostname and more details of the
deployed app.
```bash
gcloud app describe
```

If you want to view your service you can navigate to
<walkthrough-menu-navigation sectionId="APPENGINE_SECTION">AppEngine</walkthrough-menu-navigation>
via the menu.
