package models;

import java.sql.Timestamp;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Version;

import com.avaje.ebean.annotation.CreatedTimestamp;

import play.data.validation.Constraints.Required;
import play.db.ebean.Model;
import play.db.ebean.Model.Finder;

@Entity
public class Thing extends Model {

  @Id
  public Long id;

  @Required
  public String name;

  @CreatedTimestamp
  Timestamp cretime;

  @Version
  Timestamp updtime;
  
  public static Finder<Long, Thing> find = new Finder<Long, Thing>(Long.class,
      Thing.class);

}
