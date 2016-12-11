package faf

import grails.plugin.springsecurity.annotation.Secured

class HomeController {

  def index() { 
    log.debug("HomeController::index");
    def result = [:]
    result
  }

  @Secured(['ROLE_USER', 'IS_AUTHENTICATED_FULLY'])
  def login() {
    redirect action:'index'
  }
}
