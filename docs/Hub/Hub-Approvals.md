# Approvals
Approvals are mechanism of handling collections in system.

Every collection can be in multiple repositories. API in this page returns both Collection info and Repository info. The Approvals page
uses the same API as Collections page. So additional information can be found here.

If the collection is in multiple repositories (lets say 3), API result will contains 3 records:

 - Collection1 Repository1 <br>
 - Collection1 Repository2 <br>
 - Collection1 Repository3 <br>

Note that API returns also pulphref of the collection (see in pulp documentation) and this pulphref is the same for every result. So if you
want to create unique key for the row, it must be combination of collection and repository.

There are three types (also called pipeline) of repositories:

 - Rejected <br>
 - Approved <br>
 - Staging (also called Needs Review in UI) <br>

We have only Rejected repo called directly Rejected, but we can have multiple repositories with pipeline Approved and Staging.

Additional info can be found in Repositories page.

When collection is uploaded, it is uploaded usually to repository with pipeline Staging, but it does not always have to be the case.

# Rejection process
Reject operation is only for collections that are in Staging or Approved repo.

When user clicks the Reject button on a row (thus tuple Collection and its repository), collection is moved from current repository to Rejected repository - it dissapeares from original repository and appears in Rejected repository. Because collection can be in multiple repositories, repeated call of reject action will only remove the collection from the original repository and collection is not moved to the Rejected repo, because it is already there from previous operation. Collection can not be in one repository multiple times.

Example:
Collection1 is in those three repos: Repository1, Repository2, Repository3 - which will be shown as 3 rows in the UI. User does bulk action reject on all of those three rows.

Collection is moved to Rejected repo and removed from Repository1.
Collection is removed from Repository2 (and not moved to Rejected, because it is already there from previous action).
For Repository3, the same as Repository2.

# Approval process
Approval operation is available for collections that are in Staging or Rejected repo.

System will load count of all repositories with pipeline Approval. If there is only one repository with this pipeline, it will simply
move collection from its original repository to this new repository.

If more Approval repositories found, it will launch modal for selection of repositories.
User will select to what repositories (with pipeline Approved) she wants to approve the collection. Then copy operation for several collection is moved. Collection will appear in all selected repositories and is removed from original repository.

TODO - question - what happens when user selects repository to approve, while collection is already in that repository (which may happen).
If it does not fail, we can allow approval as batch operation, otherwise, approval with multiple Approval repositories have to be only single operation. Approval with single Approval repo can be always batch operation.

# Signing

Signing is described here in depth:
https://github.com/ansible/galaxy_ng/blob/master/docs/config/collection_signing.md
