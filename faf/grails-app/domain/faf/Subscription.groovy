package faf

class Subscription {
  
  User owner
  String name
  String geometry

  static constraints = {
       owner blank: false, nullable:false
        name blank: false, nullable:false
    geometry blank: false, nullable:false
  }

  static mapping = {
    geometry type:'text'
  }

}
