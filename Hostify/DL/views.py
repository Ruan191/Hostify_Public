from django.shortcuts import render, redirect
from django.http.response import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Log
from datetime import datetime
from random import random
from DL.util import generateCode
from django.template import RequestContext
import json


def index(request):
    if request.user.is_authenticated and request.user.isValid:
        user = request.user
        return render(request, "DL/index.html", {
            "docs_amount": user.docs_count,
            "max_docs_allowed": user.max_docs_allowed
        })
    else:
        return redirect('login')

def register(request):
    if request.method == "POST":
        user = User()
        sender_email = "" #Enter the email address that will send the email has to be the same as the email address in settings

        email = request.POST["register-email"]

        user.is_authenticated
        user.username = request.POST["register-username"]
        user.email = email
        
        user.v_code = str(generateCode(13))

        password = request.POST["register-password"]

        if user.username == "" and email == "" and password == "":
            return render(request, "DL/register.html", {
                "error": "All fields should be filled"
            })

        if password != request.POST["register-confirm-password"]:
            return render(request, "DL/register.html", {
                "error": "Password does not match"
            })

        user.password = password

        try:
            user.save()
            login(request, user)
            send_mail("validation code", "Here is the validation code: " + user.v_code, sender_email, [user.email], fail_silently=True)
        except:
            _user = User.objects.get(email=email)
            if not _user.isValid:
                _user.delete()
            else:
                return render(request, "DL/login.html", {
                    "error": "Account already exist!"
                }) 

            user.save()
            login(request, user)
            send_mail("validation code", "Here is the validation code: " + user.v_code, sender_email, [user.email], fail_silently=True)
        
        return redirect("validation")
        
    
    return render(request, "DL/register.html")

def _logout(request):
    logout(request)
    return redirect("index")

def _login(request):
    if request.method == "POST":
        user = ""

        try:
            user = User.objects.get(email=request.POST["login-email"])
        except:
            return render(request, "DL/login.html", {
                "error": "Email was incorrect"
            }) 

        if user.password != request.POST["login-password"]:
            return render(request, "DL/login.html", {
                "error": "Password was incorrect"
            })

        login(request, user)
        return redirect("index")

    return render(request, "DL/login.html")

def _validation(request):
    if request.method == "POST":
        v_code = request.POST["validation-code"]
        user = User.objects.get(pk=request.user.id)

        if user.v_code == v_code:
            user.isValid = True
            user.save()
            login(request, user)
            return redirect("index")
        else:
            return render(request, "DL/validation.html", {
                "error": "invalid code"
            })

    return render(request, "DL/validation.html")

def create_log(request):
    if request.method == "POST":
        user = User.objects.get(pk=request.user.id)
        if user.docs_count < user.max_docs_allowed:
            data = json.loads(request.body)
            log = Log()
            log.name = data["textfield"]
            log.owner = user
            log.date = data["date"]
            log.token = data["token"]

            log.save()
            user.docs_count += 1
            user.save()
            return HttpResponse(None, status=200)

        return render(request, "DL/index.html", {
            "error": "Max number of webpages made"
        })

def logs(request):
    user = User.objects.get(pk=request.user.id)
    if request.method == "GET" and request.user.is_authenticated:
        logs = Log.objects.filter(owner=request.user.id)
        logs = logs.order_by('-date')
        return JsonResponse([log.serialize() for log in logs], safe=False)

    if request.method == "PUT" and request.user.is_authenticated:
        data = json.loads(request.body)
        doc = Log.objects.get(id=data["id"])

        if request.user.id == doc.owner.id:
            doc.name = data["name"]
            doc.save()
        else:
            return HttpResponse(None, status=401)

        return HttpResponse(None, status=200)

    if request.method == "POST" and request.user.is_authenticated:
        data = json.loads(request.body)
        log = Log.objects.get(id=data["did"])

        if request.user.id == log.owner.id:
            log.delete()
            user.docs_count -= 1
            user.save()
        else:
            return HttpResponse(None, status=401)

        return HttpResponse(None, status=200)

    return JsonResponse([log.serialize() for log in logs], safe=False)

def doc(request, token):
    document = Log.objects.get(token=token)
    user = request.user
    
    isOwner = document.owner.id == user.id
    isMember = False

    try: 
        document.users.objects.get(id=user.id)
        isMember = True
    except:
        pass

    if request.method == "POST":
        data = json.loads(request.body)

        total_chars = len(data["html"].replace(" ", "") + data["css"].replace(" ", ""))
        print(total_chars)

        document.html = data["html"]
        document.css = data["css"]
        document.public = data["isPublic"]
        document.save()   

    if isOwner:
        
        return render(request, "DL/doc_design.html", {
            "log": document,
            "content": document.html
        })

    return redirect('login')
    


def view(request, token):
    document = Log.objects.get(token=token)

    user = request.user
    isOwner = document.owner.id == user.id
    
    content = ""

    if not document.public:
        if isOwner:
            content = document.html.replace("<script>", "").replace("!r", '<a style="color: red;">') + '<style id="view-style">' + document.css + "</style>"
        else:
            content = "<h1>This page was set to private</h1>"    
    else:
        content = document.html.replace("<script>", "").replace("!r", '<a style="color: red;">') + '<style id="view-style">' + document.css + "</style>"


    return render(request, "DL/view.html", {
        "log": document,
        "md": content
    }) 

def doc_data(request, token):
    document = Log.objects.get(token=token)
    user = request.user

    isOwner = document.owner.id == user.id
    isMember = False

    try: 
        document.users.objects.get(id=user.id)
        isMember = True
    except:
        pass
    
    if isOwner:
        
        return JsonResponse(document.serialize())
    
    return redirect('login')