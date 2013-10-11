<!--
# The index.rhtml file is the template from which the DG application's main dg.html page
# is build by SproutCore. The recommended way to make changes to this file is to make a local
# copy of it and make the necessary modifications. Unfortunately, this means that one has to
# be careful to merge any modifications made to the default SproutCore index.rhtml into the
# local copy every time one upgrades to a new version of Sproutcore.
#
# In our case, the reason to modify the default index.rhtml is to add support for Google Analytics.
# We'd like to do so without taking on the maintenance burden of re-synchronizing our local copy
# of index.rhtml with SproutCore's version every time the SproutCore version changes.
# The solution used here is to add a line to our local build script (bin/build.sh) which uses
# sed and a local sed command file (bin/insert-google-analytics.sed) to place the necessary
# code before the </head> tag.
#
# The final piece is that the buildfile is configured to use the local copy of index.rhtml only
# when performing a production build (i.e. sc-build, make deploy). Thus, 'make deploy' should be
# invoked before sc-build is used independently, so that the index.rhtml file is copied.
#
# This solution has a couple of nice properties:
# 1. The Google Analytics code is localized to a single file where it's easy to change.
# 2. The Google Analytics code is included in production builds but not debug builds.
# 3. Our local copy of index.rhtml stays synchronized with any SproutCore changes
# 4. If SproutCore were to change the index.rhtml sufficiently so that the sed script failed to
#    insert the Google Analytics code, the result would be an unmodified copy of SproutCore's
#    index.rhtml, i.e. the only difference would be that Google Analytics wouldn't be enabled.
#
# It also adds a couple of additional constraints:
# 1. sed must be installed for make deploy to succeed, i.e. it must be installed on any server
#    on which builds are done as well as on developer machines.
# 2. 'make deploy' must be run before any independent call of sc-build from the command line.
#    (This isn't much of a constraint, since we generally always use make deploy.)
# 3. The 'lib' directory must exist for the sed command to succeed.
#    (The existence of this documentation file guarantees that the required folder exists.)
#
# Note that the local lib/index.rhtml file should not be committed to version control.
#
# Kirk Swenson, 2012-04-18
# 
# Copyright ©2013 KCP Technologies, Inc., a McGraw-Hill Education Company
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
-->
