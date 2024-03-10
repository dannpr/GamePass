### Bridge contract with execution (more involved example)

So now we know everything there is to know.
Let's put our knowledge to test and create a proof of concept application that acts as a simple bridge controlled by state connector.

The scenario is as follows:
- We want to have a bridging contract from sepolia to Flare.
- We will allow users to deposit funds on sepolia side of the bridge contract together with some calldata they want executed on Flare side.
This deposit will emit event with the instructions.
- Anyone can pick up this event, create state connector attestation request and supply the proof to Flare.
- Once the proof is supplied on Flare (the other side), the receiving bridge contract will check that


Homework: Create an optimistic version that goes in another direction:
- Anyone can submit a request on Flare and event is emitted
- Collateralized 3rd parties can execute the requested transaction on the other side - thus emitting the event about execution.
- Anyone can relay the execution event back to Flare where two things happen:
  - Executing party is seen as executing the correct request and gets rewarded a bit on Flare side (happy path). 
  - Executing party is seen as executing invalid request (wrong value, address...) and is subsequently punished by having the collateral forfeited on Flare side.

Note: This is just an idea of how this works, properly assessing the collateral ratios, making sure that security assumptions hold etc is left to the reader.


Hackaton idea (built on previous idea)

We have source contract on Flare and destination contract on Sepolia and one way secure bridge telling us what is happening on Sepolia.
Flare side is therefore all knowing, while Sepolia lacks information from Flare side
TODO : grda rekurzija pride... turtles all the way down



