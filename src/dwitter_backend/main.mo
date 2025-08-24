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

  // Stable storage for dweets
  private stable var dweets: [Dweet] = [];
  private stable var nextId: Nat = 0;

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
};
