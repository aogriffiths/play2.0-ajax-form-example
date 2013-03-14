/* Thanks and credit to:
 * > jQuery
 * > underscore.js
 * > backbone.js
 * > CHRISTOPHE COENRAETS for his excellent backbone "wine cellar" tutorial.
 * > http://documentcloud.github.com/backbone/examples/todos/index.html
 * > http://documentcloud.github.com/backbone/docs/todos.html
 */


/* A Backbone.Model for "Things", this is a javascript ("client side") 
 * representation of the java ("servers side") app.models.Thing class
 * 
 * The urlRoot allows backbone.js to make a REST request for a single 
 * Thing. Play routes the request to controllers.Application.thingList(),
 * which returns a list of Things as json, which is in turn parsed into the
 * backbone.js Model.
 * 
 * The defaults are useful when creating new Things on the client side.
 */

window.Thing = Backbone.Model.extend({
  urlRoot:"/thing",  
  defaults:{
    "id":null,
    "name":"new"
  }
});

/* A Backbone.Collection for "Things", this is effectively a javascript 
 * representation of a java List<app.models.Thing>.
 * 
 * The url here allows update and delete REST operations on a single Thing.
 */

window.ThingCollection = Backbone.Collection.extend({
  model:Thing,
  url:"/thing",
  initialize:function () {
    this.comparator = this.comparatorID;
  },
  //Sets the comparator for this collection and re-sorts it.
  //This will fire a reset event which the views can listen to, 
  //to trigger a re-render.
  sortby: function(name){
    this.comparator = this["comparator" + name];
    this.sort();
  },
  comparatorID: function(ab) {
    return ab.attributes.id;
  },
  comparatorNAME: function(ab) {
    //include id, to give consistent sorting for items whose name are the same.
    return ab.attributes.name + "_" + ab.attributes.id 
  }

});

// Views

/* A Backbone.View for ThingCollection, renders the Things as a list i.e. in a 'ul' tag.
 */

window.ThingListView = Backbone.View.extend({
    /* First set of options specify the parent tag (which will be pointed to by this.el) 
     * which the view will be drawn into. From the backbone.js documentation: 
     * "this.el is created from the view's tagName, className, id and 
     * attributes properties, if specified. If not, el is an empty div."
     */
    tagName:'ul',
        
    id: "thing-list",
    /* initialize is called when the view is first created. It is expected this
     * view will be created with a model of type ThingCollection e.g. :
     * new ThingListView({model:<ThingCollection>})  
     * suitable render function are bound to ThingCollection events.
     */
    initialize:function () {
        //reset is fired when a bulk change is required.
        this.model.bind("reset", this.render,            this);
        //add is fired when a single Thing is added to the ThingCollection
        this.model.bind("add",   this.render_on_add, this);
    },
    /* render is called whenever the entire view needs to be re-drawn. It's worth
     * clearing the view first, just in case render is called more than once, e.g.
     * after a model is sorted or re-fetched from the server. 
     */ 
    render:function (eventName) {
        $(this.el).html(""); //clear the view
        _.each(this.model.models, this.renderSingleThing, this);
        return this;
    },
    /* render_on_add is called whenever a single Thing is added to the ThingCollection
     * (as per the bind, made in the initialize function above).
     */
    render_on_add:function(thing){
      this.renderSingleThing(thing).edit();
      return this;
    },
    /* Not a standard backbone.js function, but to key the code DRY 
     * this function is used by the main render function 
     * and off the back of the add event.
     */
    renderSingleThing: function(thing) {
      var thingListItemView = new ThingListItemView({model:thing})
      $(this.el).append(thingListItemView.render().el);
      return thingListItemView;
    }

});
 
window.ThingListItemView = Backbone.View.extend({
 
    tagName:"li",
 
    className: "thing-item",

    template:_.template($('#thingslist-template').html()),
 
    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.unrender, this);
    },
    /*
     * Called directly by renderSingleThing above, or called when the change event is fired.
     * 
     */
    render:function (eventName) {
        var wasediting = this.editing; //needed because resetting the HTML will case a blur which will trigger the close function below.
        $(this.el).html(this.template(this.model.toJSON()));
        this.input = this.$('.editinput');
        if(wasediting) this.edit();
        return this;
    },
    
    unrender: function () {
      $(this.el).unbind();
      $(this.el).remove();
    },
    events: {
      "blur     .edit"       : "close",
      "dblclick .view"       : "edit",
      "click    .destroy"    : "destroy"
    },
    close: function() {
      //this.$ makes it easy to select elements within this view.
      var value = this.$('.editinput').val();
      if (!value) this.clear();
      this.model.save({name: value});
      this.$el.removeClass("editing");
      //this.$el.removeClass("editing");
      this.editing = false;
    },
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
      this.editing = true;
    },
    destroy: function() {
      this.model.destroy();
    }
});


window.ThingCreateItemView = Backbone.View.extend({
  
  template:_.template($('#create-template').html()),

  initialize:function () {
      this.render();
  },

  render:function (eventName) {
      $(this.el).html(this.template());
      return this;
  },

  events:{
      "click #new2":"newThing"
  },

  newThing:function (event) {
      var thing = new Thing();
      app.thingList.add(thing);
      thing.save();
      return false;
  }
});


window.HeaderView = Backbone.View.extend({
  
  template:_.template($('#header-template').html()),

  initialize:function () {
      this.render();
  },

  render:function (eventName) {
      $(this.el).html(this.template());
      return this;
  },

  events:{
      "click #newThing": "newThing",
      "click #sortId"  : "sortId",
      "click #sortName": "sortName"
  },

  newThing:function (event) {
      var thing = new Thing();
      thing.save();
      app.thingList.add(thing);
      return false;
  },
  sortId:function (event) {
    app.thingList.sortby("ID")
    return false;
  },
  sortName:function (event) {
    app.thingList.sortby("NAME")
    return false;
  }
});

// Router
var AppRouter = Backbone.Router.extend({
 
    routes:{
        "":"list"
    },

    initialize:function () {
      $('#header').html(new HeaderView().render().el);
    },
 
    list:function () {
        this.thingList = new ThingCollection();
        this.thingListView = new ThingListView({model:this.thingList});
        this.thingList.fetch();
        $('#thingslist').html(this.thingListView.render().el);
    }
 
});
 
var app = new AppRouter();
Backbone.history.start();