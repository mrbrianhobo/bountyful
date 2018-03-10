# bountyful #
A Chrome Extension to post bounties for StackExchange questions 

![](bountyful.gif)

ETHDenver Prize Winner for Best Bounty Network (Bounties Network + Gitcoin)
 - https://github.com/gitcoinco/ethdenver/issues/10
 - https://medium.com/bounties-network/start-your-very-own-bounty-network-at-ethdenver-9dd89de374b
 - https://medium.com/gitcoin/eth-denver-bounties-track-b7dfdb759759
 - https://medium.com/gitcoin/gitcoin-ethdenver-wrap-up-cc52d9874b38

## Inspiration ##
A bounty network for all forums supported by StackExchange (StackOverflow, MathOverflow, AskUbuntu ...)

## What it does ##
Allows users to attach a bounty to questions they post on forums, in order to encourage people to respond more satisfactorily.

## How we built it ##
Adapted an existing Chrome extension supported on StackExchange originally designed for "watching" certain posts. Instead, we allow users issuing questions to also simultaneously issue a bounty in Ethereum. Those answering the question (who have the extension) then have the option to issue a "claim" or a bounty "fulfillment request". The Original Poster is then allowed to pick among these claims (similarly to StackExchange's normal bounty functionality), in order to pick a winning answer. After having picked a winning answer, the bounty is held in escrow until the winner of the bounty calls the smart contract to claim it.

## Challenges we ran into ##
We are quite certain that Web3 is almost impossible to inject into a Chrome Extension app. There is little to no documentation on how this might be achieved, and while we tried multiple ways (deploying on Rinkeby and locally, incorporating web3 manually, etc) it was impossible to preserve a version of Web3 in the extension environment that would be capable of fully interfacing with the StandardBounties contract. As a last ditch effort to have a working Proof of Concept, we wrote a script to redirect the user to a populated Bounty Factory form in order to fill out a bounty. 

## Accomplishments that we're proud of ##
Learning to build a Chrome Extension. Learning to integrate Web3, working with IPFS.

## What we learned ##
It's difficult to integrate Web3 with something it was not designed for. Like impossible difficult at 2 AM.

## What's next for Bountyful ##
We have not fully implemented the process of finalizing a winning answer. We had also previously talked about the edge cases where either the Original Poster does not pick a winner before the deadline, or where the winner of the bounty does not claim it before the deadline: in these cases, the money held in escrow will collect in a pool of democratized funds, used as a time bonus to those who are consistently best early responders.

## Team ##
Tammy Vu (tammylvu@berkeley.edu)
Gillian Chu (gillichu@berkeley.edu)
Brian Ho (brian.ho@berkeley.edu)


## Built With ##
solidity, javascript, html, css
