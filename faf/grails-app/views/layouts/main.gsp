<!doctype html>
<html lang="en" class="no-js">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <title>
        <g:layoutTitle default="Filtered Alert Hub"/>
    </title>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>

    <asset:stylesheet src="application.css"/>
    <asset:javascript src="bootstrap-all.js"/>

    <g:layoutHead/>
</head>
<body>

  <div class="navbar navbar-default navbar-fixed-top">
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">Filtered Alert Hub</a>
      </div>

      <div class="collapse navbar-collapse pull-right">
        <ul class="nav navbar-nav">
          <sec:ifLoggedIn>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">${sec.username()}<b class="caret"></b></a>
              <ul class="dropdown-menu">
                <li><g:link controller="home" action="logout">Logout</g:link></li>
                <li class="divider"></li>
                <li class="dropdown-header">Nav header</li>
                <li><a href="#">Separated link</a></li>
              </ul>
            </li>
          </sec:ifLoggedIn>
          <sec:ifNotLoggedIn>
            <li class="${controllerName=='home' && actionName=='login' ? 'active' : ''}"><g:link controller="home" action="login">Login</g:link></li>
          </sec:ifNotLoggedIn>
        </ul>
      </div>

      <div class="collapse navbar-collapse">
        <ul class="nav navbar-nav">
          <li class="${controllerName=='home' && actionName=='index' ? 'active' : ''}"><g:link controller="home" action="index">Home</g:link></li>
          <sec:ifAnyGranted roles="ROLE_ADMIN,KBPLUS_EDITOR">
            <li class="${controllerName=='subscriptions' && actionName=='index' ? 'active' : ''}"><g:link controller="subscriptions" action="index">Subscriptions</g:link></li>
          </sec:ifAnyGranted>
        </ul>
      </div><!--/.nav-collapse -->
    </div>
  </div>
  
  <g:layoutBody/>

  <asset:javascript src="application.js"/>

</body>
</html>
