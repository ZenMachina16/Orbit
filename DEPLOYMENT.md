# Orbit - Mainnet Deployment Guide

This guide explains how to deploy the Orbit decentralized microblogging platform to the live Internet Computer mainnet.

## Prerequisites

1. **ICP Tokens**: You need ICP tokens to pay for canister creation and cycles
2. **Secure Identity**: A properly configured dfx identity
3. **Internet Connection**: Stable connection for deployment

## Step 1: Prepare Your Identity

### Create a Secure Identity
```bash
# Create a new identity for mainnet
dfx identity new mainnet

# Set it as default
dfx identity use mainnet

# Get your principal
dfx identity get-principal
```

### Get Your Account Address
```bash
# Get your account address for receiving ICP
dfx ledger account-id
```

## Step 2: Fund Your Account

1. **Purchase ICP** from a cryptocurrency exchange (Coinbase, Binance, etc.)
2. **Send ICP** to your account address from Step 1
3. **Wait for confirmation** (usually takes a few minutes)

## Step 3: Convert ICP to Cycles

```bash
# Convert ICP to cycles (recommended: 0.1-0.5 ICP)
dfx cycles convert --amount=0.1 --network ic
```

## Step 4: Deploy to Mainnet

```bash
# Deploy all canisters to mainnet
dfx deploy --network ic
```

## Step 5: Verify Deployment

After successful deployment, you'll see URLs like:
```
Frontend canister via browser:
  dwitter_frontend:
    - https://[canister-id].ic0.app/
Backend canister via Candid interface:
  dwitter_backend: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=[canister-id]
```

## Step 6: Configure Internet Identity

For production, you'll need to:

1. **Update the Internet Identity URL** in your frontend code:
   ```javascript
   // In AuthPage.jsx, change the identityProvider URL
   identityProvider: "https://identity.ic0.app"
   ```

2. **Redeploy** after making changes:
   ```bash
   dfx deploy --network ic
   ```

## Cost Estimates

- **Canister Creation**: ~0.1 ICP per canister
- **Cycles per Month**: ~0.01-0.05 ICP depending on usage
- **Total Initial Cost**: ~0.2-0.3 ICP

## Security Considerations

1. **Backup Your Identity**: Save your seed phrase securely
2. **Use Hardware Wallet**: Consider using a hardware wallet for large amounts
3. **Monitor Cycles**: Check cycle balance regularly
4. **Test Locally**: Always test changes locally before mainnet deployment

## Troubleshooting

### Insufficient Cycles
```bash
# Check cycle balance
dfx cycles balance --network ic

# Convert more ICP to cycles
dfx cycles convert --amount=0.1 --network ic
```

### Identity Issues
```bash
# List identities
dfx identity list

# Switch identity
dfx identity use [identity-name]

# Get principal
dfx identity get-principal
```

### Network Issues
```bash
# Check network status
dfx ping --network ic

# Check canister status
dfx canister status [canister-id] --network ic
```

## Post-Deployment

1. **Test All Features**: Verify authentication, posting, and timeline
2. **Monitor Performance**: Check canister metrics
3. **Backup Canister IDs**: Save your canister IDs for future reference
4. **Share Your App**: Share the mainnet URL with users

## Example Mainnet URLs

Once deployed, your app will be available at:
- **Frontend**: `https://[your-frontend-canister-id].ic0.app/`
- **Backend**: `https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=[your-backend-canister-id]`

## Support

For deployment issues:
- Check the [Internet Computer documentation](https://internetcomputer.org/docs/)
- Review [DFX deployment guide](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- Join the [ICP Discord community](https://discord.gg/jnjVVQaE2C)

---

**Note**: This is a demonstration deployment. For production use, ensure you have proper security measures and sufficient funding for ongoing operations.
