# D3 Connect Snap

The D3 Connect Snap is a Metamask extension that enables custom name resolution using [D3 Connect](https://docs.d3.app/integrating-d3-infrastructure)

MetaMask Snaps is a system that allows anyone to safely expand the capabilities
of MetaMask. A _snap_ is a program that we run in an isolated environment that
can customize the wallet experience.

## Snaps is pre-release software

To interact with the D3 Connect Snap, you will need to install [MetaMask Flask](https://metamask.io/flask/),
a canary distribution for developers that provides access to upcoming features.

## Getting Started

Clone the [d3-connect-snap repository](https://github.com/MetaMask/template-snap-monorepo/generate)
and set up the development environment:

```shell
yarn install && yarn start
```

This runs a local development server listening on http://localhost:8000. Navigate to http://localhost:8000/ in your browser where MetaMask Flask is installed and click the Connect button. This will open a prompt within MetaMask Flask to install the D3 Connect Snap extension.

Once installed, you can send crypto to any wallet using a D3 name (e.g. `d3connect.core`) that is mapped to a wallet address. To purchase your D3 name, go to the [D3 App
Marketplace](https://d3.app).

