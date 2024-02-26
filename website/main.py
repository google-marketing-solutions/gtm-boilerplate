# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""A simple e-commerce store using Flask, Angular & Google Tag Manager."""

import os
import flask


# The port to run the application on
PORT = int(os.environ.get('PORT', 8080))

ANGULAR_BUILD_PATH = './ui/dist/gtm-boilerplate'

app = flask.Flask(__name__)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path.endswith('.js') or path.endswith('.css') or path.startswith('assets'):
        return flask.send_from_directory(
            ANGULAR_BUILD_PATH,
            path,
        )
    return flask.send_from_directory(ANGULAR_BUILD_PATH, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)
