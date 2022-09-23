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

Open <walkthrough-editor-open-file filePath="./env_variables.yaml">
env_variables.yaml</walkthrough-editor-open-file>

Fill in the GTM Web Container ID and set a random string for the secret key. You
can update the currency variables too if you want.

Variable             | Description
-------------------- | -----------
GTM_WEB_CONTAINER_ID | Paste your GTM Web Container ID here (formatted as GTM-XXXXXX).
SECRET_KEY           | A secret key that will be used for securely signing the session cookie. [See the Flask docs](https://flask.palletsprojects.com/en/2.1.x/config/#SECRET_KEY) for further information regarding the secret key.
CURRENCY_CODE        | Currency code used in the e-commerce shop, this is also reported in the purchase events.
CURRENCY_SYMBOL      | Currency symbol used in the e-commerce shop.

After that, let's get the deployment started.

## Deploying

We'll first initialise `gcloud`, making sure you're logged in and have an
active account selected. If you've already intialised `gcloud` you can skip
this step. Follow the prompts in the console during the initialisation.
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
