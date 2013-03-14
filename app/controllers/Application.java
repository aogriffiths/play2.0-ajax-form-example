package controllers;

import java.io.IOException;
import java.util.List;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ObjectNode;

import models.Thing;
import play.*;
import play.api.templates.Html;
import play.data.Form;
import play.libs.Json;
import play.mvc.*;

import views.html.*;

public class Application extends Controller {

  public static Result index() {
    return ok(views.html.index.render());
  }

  /*
   * thingList
   * 
   * returns a json list of all things in the database
   */
  public static Result thingList() {
    Logger.debug("thingList");
    List<Thing> things = Thing.find.findList();
    // ObjectNode result = Json.newObject();
    ObjectMapper mapper = new ObjectMapper();
    JsonNode root = mapper.valueToTree(things);
    return ok(root);
  }

  /*
   * thingItem
   * 
   * returns a single json thing from the database
   */
  public static Result thingItem(Long id) {
    Logger.debug("thingItem");
    return TODO;
  }
  
  /*
   * thingCreate
   * 
   * Creates an new Thing
   */
  @BodyParser.Of(play.mvc.BodyParser.Json.class)
  public static Result thingCreate() throws JsonParseException, JsonMappingException, IOException {
    Logger.debug("thingCreate");
    org.codehaus.jackson.JsonNode json = request().body().asJson();
    ObjectMapper mapper = new ObjectMapper();
    Thing thing = mapper.readValue(json, Thing.class);
    thing.save();
    thing.refresh();
    return ok(mapper.valueToTree(thing));
  }

  /*
   * thingUpdate
   * 
   * Updates an existing Thing by id
   */
  @BodyParser.Of(play.mvc.BodyParser.Json.class)
  public static Result thingUpdate(Long id) throws JsonParseException, JsonMappingException, IOException {
    Logger.debug("thingUpdate");
    //Thing thing = Thing.find.byId(id);
    org.codehaus.jackson.JsonNode json = request().body().asJson();
    ObjectMapper mapper = new ObjectMapper();
    Thing thing = mapper.readValue(json, Thing.class);
    thing.id = id;
    thing.update();
    return ok();
  }

  /*
   * thingDelete
   * 
   * Updates an existing thing by id
   */
  public static Result thingDelete(Long id) {
    Logger.debug("thingDelete");
    Thing thing = Thing.find.byId(id);
    thing.delete();
    return ok();
  }
  
}