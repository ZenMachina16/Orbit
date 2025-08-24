import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

actor {
  // Define the Dweet data structure
  type Dweet = {
    id: Nat;
    author: Principal;
    message: Text;
    timestamp: Int;
  };

  // Legacy User type for migration (will be removed after migration)
  type LegacyUser = {
    principal: Principal;
    username: Text;
    displayName: Text;
    bio: Text;
    joinDate: Int;
    dweetCount: Nat;
  };

  // Stable storage for dweets
  private stable var dweets: [Dweet] = [];
  private stable var nextId: Nat = 0;

  // Legacy stable storage for migration
  private stable var users: [(Principal, LegacyUser)] = [];

  // Post a new dweet
  public shared({caller}) func postDweet(message: Text) : async {#Ok: Nat; #Err: Text} {
    // Validate message length (max 280 characters)
    if (Text.size(message) > 280) {
      return #Err("Message too long. Maximum 280 characters allowed.");
    };
    
    // Validate message is not empty
    if (Text.size(message) == 0) {
      return #Err("Message cannot be empty.");
    };

    // Create new dweet
    let newDweet: Dweet = {
      id = nextId;
      author = caller;
      message = message;
      timestamp = Time.now();
    };

    // Add to storage
    dweets := Array.append(dweets, [newDweet]);
    nextId := nextId + 1;

    #Ok(newDweet.id)
  };

  // Post a dweet with user ID (for local development)
  public shared({caller}) func postDweetWithUserId(message: Text, userId: Text) : async {#Ok: Nat; #Err: Text} {
    // Validate message length (max 280 characters)
    if (Text.size(message) > 280) {
      return #Err("Message too long. Maximum 280 characters allowed.");
    };
    
    // Validate message is not empty
    if (Text.size(message) == 0) {
      return #Err("Message cannot be empty.");
    };

    // Create new dweet with user ID embedded in message for local development
    let messageWithUserId = if (Text.size(userId) > 0) {
      "[" # userId # "] " # message
    } else {
      message
    };

    let newDweet: Dweet = {
      id = nextId;
      author = caller;
      message = messageWithUserId;
      timestamp = Time.now();
    };

    // Add to storage
    dweets := Array.append(dweets, [newDweet]);
    nextId := nextId + 1;

    #Ok(newDweet.id)
  };

  // Get all dweets (reverse chronological order)
  public query func getDweets() : async [Dweet] {
    // Return dweets in reverse chronological order (newest first)
    Array.reverse(dweets)
  };

  // Get dweets count
  public query func getDweetsCount() : async Nat {
    dweets.size()
  };

  // Get a specific dweet by ID
  public query func getDweet(id: Nat) : async {#Ok: Dweet; #Err: Text} {
    for (dweet in dweets.vals()) {
      if (dweet.id == id) {
        return #Ok(dweet);
      };
    };
    #Err("Dweet not found")
  };

  // Edit a dweet (only by the original author)
  public shared({caller}) func editDweet(id: Nat, newMessage: Text) : async {#Ok: Dweet; #Err: Text} {
    // Validate message length (max 280 characters)
    if (Text.size(newMessage) > 280) {
      return #Err("Message too long. Maximum 280 characters allowed.");
    };
    
    // Validate message is not empty
    if (Text.size(newMessage) == 0) {
      return #Err("Message cannot be empty.");
    };

    // Find and update the dweet
    var updatedDweets: [Dweet] = [];
    var found: Bool = false;
    
    for (dweet in dweets.vals()) {
      if (dweet.id == id) {
        // Check if caller is the author
        if (Principal.equal(dweet.author, caller)) {
          let updatedDweet: Dweet = {
            id = dweet.id;
            author = dweet.author;
            message = newMessage;
            timestamp = dweet.timestamp; // Keep original timestamp
          };
          updatedDweets := Array.append(updatedDweets, [updatedDweet]);
          found := true;
        } else {
          return #Err("You can only edit your own dweets.");
        };
      } else {
        updatedDweets := Array.append(updatedDweets, [dweet]);
      };
    };
    
    if (found) {
      dweets := updatedDweets;
      // Return the updated dweet
      for (dweet in dweets.vals()) {
        if (dweet.id == id) {
          return #Ok(dweet);
        };
      };
      #Err("Error updating dweet")
    } else {
      #Err("Dweet not found")
    };
  };

  // Delete a dweet (only by the original author)
  public shared({caller}) func deleteDweet(id: Nat) : async {#Ok: Nat; #Err: Text} {
    // Find and remove the dweet
    var updatedDweets: [Dweet] = [];
    var found: Bool = false;
    
    for (dweet in dweets.vals()) {
      if (dweet.id == id) {
        // Check if caller is the author
        if (Principal.equal(dweet.author, caller)) {
          found := true;
          // Don't add this dweet to the updated array (effectively deleting it)
        } else {
          return #Err("You can only delete your own dweets.");
        };
      } else {
        updatedDweets := Array.append(updatedDweets, [dweet]);
      };
    };
    
    if (found) {
      dweets := updatedDweets;
      #Ok(id)
    } else {
      #Err("Dweet not found")
    };
  };

  // Get dweets by a specific author
  public query func getDweetsByAuthor(author: Principal) : async [Dweet] {
    var authorDweets: [Dweet] = [];
    
    for (dweet in dweets.vals()) {
      if (Principal.equal(dweet.author, author)) {
        authorDweets := Array.append(authorDweets, [dweet]);
      };
    };
    
    // Return dweets in reverse chronological order (newest first)
    Array.reverse(authorDweets)
  };

  // Migration function to clear legacy user data
  public shared({caller}) func migrateClearUsers() : async Text {
    users := [];
    "Migration completed: Legacy user data cleared"
  };

  // System functions for stable storage
  system func preupgrade() {
    // Keep the legacy users array for migration
  };

  system func postupgrade() {
    // Migration completed, legacy data can be cleared
    users := [];
  };
};
