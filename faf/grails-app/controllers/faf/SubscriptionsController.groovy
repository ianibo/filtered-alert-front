package faf

import grails.plugin.springsecurity.annotation.Secured

class SubscriptionsController {

  @Secured(['ROLE_USER', 'IS_AUTHENTICATED_FULLY'])
  def index() { 
    log.debug("SubscriptionsController::index");
    def result = [:]
    result
  }

  @Secured(['ROLE_USER', 'IS_AUTHENTICATED_FULLY'])
  def create() { 
    log.debug("SubscriptionsController::create");
    def result = [:]
    result
  }

 

}
