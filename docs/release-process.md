# Spyderisk releases

Note - this draft document is discussed in [GitHub Issue #185](https://github.com/Spyderisk/system-modeller/issues/185). 

**Status** - Spyderisk releases at present are a first step towards giving our
users an identifiable version. We do not claim Spyderisk is stable because we
are working on many quite fundamental features. But this is a good way for us
to communicate with users and say things like "if you deploy version 3.6
instead of 3.5, we think your problem will be fixed."

**Goal** - our purpose is to publish a numbered Spyderisk release with a git tag as
the current stable release. For example, here is
[version 3.5](https://github.com/Spyderisk/system-modeller/releases/tag/v3.5.0),
released 30th April 2024. Until it is replaced, version 3.5 will be stable and 
[the ```dev``` branch](https://github.com/Spyderisk/system-modeller/tree/dev)
is where all contributions are made, including merging short-lived feature branches.

>  Until it is replaced, version 3.5 will be stable
> 
Technically any tagged versions are unique, so will remain stable, as they continue to exist. Any tagged versions are always made off the main branch, after code is merged in from dev.

**Numbering** - in this early stage of Spyderisk, we do not do minor point releases.
If the current release is 3.5, the next will be 3.6, even if the new release only
fixes one critical bug. We do not have the resources yet to maintain older stable 
releases. There will never be Spyderisk version 3.5.1 or 3.6.2.

> There will never be Spyderisk version 3.5.1 or 3.6.2.

I think this is wrong. We may still create a minor release when fixing a major bug found in a recent major release. See further comments [here](https://github.com/Spyderisk/system-modeller/issues/185#issuecomment-2211049801)

**GitHub dependency** - we try to avoid depending on GitHub-specific features,
many of which are of little benefit to Spyderisk and all of which are intended
to create commercial lockin to GitHub.  We do of course make extensive use of GitHub's issue
system and and therefore it makes sense to use milestones. However we deliberately
limit our use of GitHub's
[powerful Release Feature](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository). As with the rest of the Spyderisk Open Project, we want the release
process to be able to move to any of the open source alternatives to GitHub
with relative ease. We appreciate GitHub as a useful tool for Spyderisk today, but 
commercial software forges always come and go over the years.

The steps in the process are:

* Discussion
* Update OpenAPI doc
* Do checks/Run tests
* Curate issues
* Set version in source code
* Create tag
* Do a GitHub release
* Post-release tasks

## Discussion

Tell the other Spyderisk developers via the development mailing list: "I
propose making a release from the '''dev''' branch soon, are there any merge
requests people feel should be a release blocker?". Agree a release date and
the new version number. This also informs any users watching the development list.

> "I propose making a release from the '''dev''' branch soon

Again, it should be understood that code contributions will be merged into dev, then finally dev merged into main, prior to tagging and releasing.

Times to avoid making a release:
* on a Friday [AoE](https://en.wikipedia.org/wiki/Anywhere_on_Earth)
* just before a lot of the Spyderisk audience goes on a public
  holiday such as Western Christmas

Avoid these times because they cause us to lose the immediate testing that often
happens in the initial burst of interest, and also the release gets lost
in the noise of everyone returning to work.

## Update OpenAPI doc

Once all code contributions have been merged into dev, the OpenAPI doc should be updated, describing the REST API of Spyderisk (N.B. this step is only required if any of the Java Controller methods (endpoints or data types) have changed since the last release). See [TODO]() for further details. **(N.B. I think this section has been removed from the docs?).**

## Do checks and run tests

See [comment](https://github.com/Spyderisk/system-modeller/issues/185#issuecomment-2211049801) in issue #185: 

## Curate issues

Use
[GitHub's Create milestone](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/creating-and-editing-milestones-for-issues-and-pull-requests)
facility for the new release, collecting all issues that will be addressed in this release.
The milestone name should match the release number.

Normally, in fact, the release milestone will have already been created some time before, and several issues already assigned to it. In the final stage, any issues (or pull requests) recently closed that had not been assigned a milestone can be assigned to this one.

## Set version in source code

The system-modeller version is set in `build.gradle`. For example, in the dev branch this might be:
```
def systemModellerVersion = "3.6.0-SNAPSHOT"
```
Prior to releasing, this should be set to a proper release number, to match the version that will be tagged, e.g. `3.6.0`. This should be committed to the dev branch, then dev merged into main (N.B. After release, this version should be incremented to a suitable version, e.g. `3.7.0-SNAPSHOT`.

## ~~Tag version in GitHub~~

* ~~Update the tag in system-modeller-deployment and test the deployment gives the correct version~~

> Update the tag in system-modeller-deployment and test the deployment gives the correct version

I think this section should be moved until much later - at this point, we don't yet have a system-modeller docker image that can be used/tested with system-modeller-deployment. Furthermore, the Github tag will actually get created at the point of creating the release (see further below).

## ~~Fill in the release template~~

* ~~gives binary links~~
* ~~update deployment including stable release of system modeller~~

## Create a new release

1. In [releases](https://github.com/Spyderisk/system-modeller/releases), click `Draft a new release`
2. Type in a version number for the release and select `Create new tag`
3. For the target, select "main" branch
4. Select `Previous tag` (this enables Github to determine changes since last release)
5. In the `Release title`, enter the same as the release tag
6. Above the description field, click `Generate release notes`
7. Adjust release notes as desired (see below)
8. If you're ready to publicize your release, click `Publish release`. To work on the release later, click `Save draft`

Further details are available [here](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes).

The automatically generated release notes have a draft structure, including a list of pull requests since the last release. It is preferable to group these code changes into sections, e.g. "Bug fixes", "Improvements". A suitable example/template can be found [here](https://github.com/Spyderisk/system-modeller/releases/tag/v3.5.0).

## Post-release tasks

> * update README in system-modeller
> * update README in system-modeller-deployment

Not understanding the purpose of this, and why it should be post-release? Please clarify what and why we should update.

Finally, once system-modeller is released, system-modeller-deployment needs to be tested with the resulting docker image (by updating .env in main branch to specify the new release version). Then we will need to release a corresponding version of system-modeller-deployment. Maybe this description needs a specific section?

# Future

A formal release process requires resources allocated to QA/test.
