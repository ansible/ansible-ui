Hands up to Jirka Jerabek, he helped with the connection to backend. This console allows us to run some operations in the backend directly
using python codes, it works similar to console in debugger in browser.

First usage was to insert running task, but it may be used for further things.

How to do it. In oci_env folder:

oci-env shell

pip3 install django-extensions

exit

oci-env shell python

// here comes the commands, for example:
Task.objects.create(state="running", name="iamrunning")

