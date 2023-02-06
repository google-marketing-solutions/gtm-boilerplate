# Soteria Ecommerce Demo Store

This code provides a sample e-commerce demo store that is set up with Google
Tag Manager.

## Google Tag Manager

If the solution is to be used with Google Tag Manager, a web container needs to
be set up in advance of the deployment. After setting this up, make a note of
the web container ID. This is used with the deployment.

## Currency

By default, the project uses `GBP` `£` as the currency. You can override this by
optionally setting two environment variables `CURRENCY_CODE` and
`CURRENCY_SYMBOL`. For example:
```
CURRENCY_CODE=USD
CURRENCY_SYMBOL=$
```
Note that the currency code must be in [this list of supported codes](
https://support.google.com/analytics/answer/9796179).

_**Limitation**: `products.py` declares the example products: the prices are
hard-coded, and no currency conversion happens. If the currency exchange rate is
significantly different to the British Pound, these prices might seem unusual
and would need to be amended._


## App Engine Deployment

1. Create a new Google Cloud Project.
2. Navigate to [App Engine](https://console.cloud.google.com/appengine) and
   create an instance.
3. Open the file named `env_variables.yaml`, that contains the following info:
   ```yaml
   env_variables:
     GTM_WEB_CONTAINER_ID: 'GTM-XXXXXX'
     SECRET_KEY: 'RANDOM_STRING'
     CURRENCY_CODE: GBP
     CURRENCY_SYMBOL: £
   ```
   [See the Flask docs](
   https://flask.palletsprojects.com/en/2.1.x/config/#SECRET_KEY) regarding the
   secret key.
4. Fill in the GTM Web Container ID and set a random string for the secret key. You
can update the currency variables too if you want.
5. Run `gcloud init`
6. Run `gcloud app deploy`

### Guided Deployment
Click the Open in Cloud Shell button to open this repository in Google Cloud Shell
and follow a guided tutorial.

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://shell.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fgtech-professional-services%2Fgtm-boilerplate&cloudshell_git_branch=main&cloudshell_workspace=.%2Fwebsite&cloudshell_tutorial=tutorial.md)

## Disclaimers

__This is not an officially supported Google product.__

Copyright 2022 Google LLC. This solution, including any related sample code or
data, is made available on an “as is,” “as available,” and “with all faults”
basis, solely for illustrative purposes, and without warranty or representation
of any kind. This solution is experimental, unsupported and provided solely for
your convenience. Your use of it is subject to your agreements with Google, as
applicable, and may constitute a beta feature as defined under those agreements.
To the extent that you make any data available to Google in connection with your
use of the solution, you represent and warrant that you have all necessary and
appropriate rights, consents and permissions to permit Google to use and process
that data. By using any portion of this solution, you acknowledge, assume and
accept all risks, known and unknown, associated with its usage, including with
respect to your deployment of any portion of this solution in your systems, or
usage in connection with your business, if at all.
