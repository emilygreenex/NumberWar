import { useCallback, useEffect, useMemo, useState } from 'react';
import { Contract } from 'ethers';
import { useAccount, usePublicClient } from 'wagmi';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import '../styles/NumberWar.css';

type DecryptionResult = Record<string, string>;

const MIN_VALUE = 1;
const MAX_VALUE = 10;

const isZeroCiphertext = (value: string | null | undefined) => {
  if (!value) {
    return true;
  }
  return /^0x0+$/i.test(value);
};

const parseDecryptedUint = (value?: string): number | null => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseDecryptedBool = (value?: string): boolean | null => {
  if (!value) {
    return null;
  }
  return value === '1' || value.toLowerCase() === 'true';
};

export function NumberWarGame() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();

  const [activeRound, setActiveRound] = useState(false);
  const [systemCiphertext, setSystemCiphertext] = useState<string | null>(null);
  const [systemNumber, setSystemNumber] = useState<number | null>(null);
  const [outcomeCiphertext, setOutcomeCiphertext] = useState<string | null>(null);
  const [roundOutcome, setRoundOutcome] = useState<boolean | null>(null);
  const [playerNumber, setPlayerNumber] = useState('1');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const canInteract = useMemo(() => !!address && !!instance && !!signerPromise, [address, instance, signerPromise]);

  const decryptHandles = useCallback(
    async (handles: string[]): Promise<DecryptionResult> => {
      if (!instance || !address) {
        throw new Error('Encryption service unavailable');
      }

      const resolvedSigner = await signerPromise;
      if (!resolvedSigner) {
        throw new Error('Signer unavailable');
      }

      const validHandles = handles.filter((handle) => !isZeroCiphertext(handle));
      if (validHandles.length === 0) {
        return {};
      }

      const keypair = instance.generateKeypair();
      const contractAddresses = [CONTRACT_ADDRESS];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';

      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

      const signature = await resolvedSigner.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message,
      );

      const handleContractPairs = validHandles.map((handle) => ({
        handle,
        contractAddress: CONTRACT_ADDRESS,
      }));

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace(/^0x/, ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays,
      );

      return result as DecryptionResult;
    },
    [address, instance, signerPromise],
  );

  const refreshActiveRound = useCallback(async () => {
    if (!publicClient || !address) {
      setActiveRound(false);
      return false;
    }

    try {
      const result = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'hasActiveRound',
        args: [address],
      })) as boolean;

      setActiveRound(result);
      return result;
    } catch (error) {
      setActiveRound(false);
      return false;
    }
  }, [address, publicClient]);

  const loadSystemNumber = useCallback(
    async (decrypt: boolean) => {
      if (!publicClient || !address) {
        setSystemCiphertext(null);
        setSystemNumber(null);
        return;
      }

      try {
        const encryptedValue = (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getSystemNumber',
          args: [address],
        })) as string;

        setSystemCiphertext(encryptedValue);

        if (decrypt && !isZeroCiphertext(encryptedValue)) {
          setIsDecrypting(true);
          const decrypted = await decryptHandles([encryptedValue]);
          setSystemNumber(parseDecryptedUint(decrypted[encryptedValue]));
        }
      } catch (error) {
        setSystemCiphertext(null);
        setSystemNumber(null);
      } finally {
        setIsDecrypting(false);
      }
    },
    [address, decryptHandles, publicClient],
  );

  const loadOutcome = useCallback(
    async (decrypt: boolean) => {
      if (!publicClient || !address) {
        setOutcomeCiphertext(null);
        setRoundOutcome(null);
        return;
      }

      try {
        const encryptedValue = (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getLastOutcome',
          args: [address],
        })) as string;

        setOutcomeCiphertext(encryptedValue);

        if (decrypt && !isZeroCiphertext(encryptedValue)) {
          setIsDecrypting(true);
          const decrypted = await decryptHandles([encryptedValue]);
          setRoundOutcome(parseDecryptedBool(decrypted[encryptedValue]));
        }
      } finally {
        setIsDecrypting(false);
      }
    },
    [address, decryptHandles, publicClient],
  );

  const resetRoundState = () => {
    setSystemCiphertext(null);
    setSystemNumber(null);
    setOutcomeCiphertext(null);
    setRoundOutcome(null);
  };

  const handleJoin = async () => {
    if (!canInteract) {
      setErrorMessage('Connect your wallet and wait for encryption service to load.');
      return;
    }

    setIsJoining(true);
    setStatusMessage('Preparing a new encrypted round...');
    setErrorMessage(null);
    resetRoundState();

    try {
      const resolvedSigner = await signerPromise;
      if (!resolvedSigner) {
        throw new Error('Signer unavailable');
      }

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, resolvedSigner);
      const tx = await contract.joinGame();
      setStatusMessage('Waiting for confirmation...');
      await tx.wait();

      setStatusMessage('Round created. Decrypting system number...');
      await refreshActiveRound();
      await loadSystemNumber(true);
    } catch (error) {
      console.error('Join game failed', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to join the game');
    } finally {
      setIsJoining(false);
      setStatusMessage(null);
    }
  };

  const handleSubmit = async () => {
    if (!canInteract) {
      setErrorMessage('Connect your wallet and wait for encryption service to load.');
      return;
    }

    const numericValue = Number(playerNumber);
    if (!Number.isInteger(numericValue) || numericValue < MIN_VALUE || numericValue > MAX_VALUE) {
      setErrorMessage(`Enter a number between ${MIN_VALUE} and ${MAX_VALUE}.`);
      return;
    }

    if (!activeRound) {
      setErrorMessage('Start a round before submitting your number.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Encrypting your number...');
    setErrorMessage(null);

    try {
      const resolvedSigner = await signerPromise;
      if (!resolvedSigner) {
        throw new Error('Signer unavailable');
      }

      if (!instance || !address) {
        throw new Error('Encryption service unavailable');
      }

      const buffer = instance.createEncryptedInput(CONTRACT_ADDRESS, address);
      buffer.add8(BigInt(numericValue));
      const encryptedInput = await buffer.encrypt();

      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, resolvedSigner);
      const tx = await contract.submitNumber(encryptedInput.handles[0], encryptedInput.inputProof);

      setStatusMessage('Waiting for confirmation...');
      await tx.wait();

      setStatusMessage('Decrypting the outcome...');
      await refreshActiveRound();
      await loadOutcome(true);
    } catch (error) {
      console.error('Submit number failed', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit your number');
    } finally {
      setIsSubmitting(false);
      setStatusMessage(null);
    }
  };

  const handleDecryptSystemNumber = async () => {
    if (!systemCiphertext) {
      setErrorMessage('No encrypted system number available.');
      return;
    }

    setErrorMessage(null);
    try {
      setIsDecrypting(true);
      const decrypted = await decryptHandles([systemCiphertext]);
      setSystemNumber(parseDecryptedUint(decrypted[systemCiphertext]));
    } catch (error) {
      console.error('Decrypt system number failed', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to decrypt system number');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDecryptOutcome = async () => {
    if (!outcomeCiphertext || isZeroCiphertext(outcomeCiphertext)) {
      setErrorMessage('No encrypted outcome available.');
      return;
    }

    setErrorMessage(null);
    try {
      setIsDecrypting(true);
      const decrypted = await decryptHandles([outcomeCiphertext]);
      setRoundOutcome(parseDecryptedBool(decrypted[outcomeCiphertext]));
    } catch (error) {
      console.error('Decrypt outcome failed', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to decrypt the outcome');
    } finally {
      setIsDecrypting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const syncState = async () => {
      if (!address || !publicClient) {
        setActiveRound(false);
        resetRoundState();
        return;
      }

      const currentActive = await refreshActiveRound();
      if (cancelled) {
        return;
      }

      if (currentActive) {
        await loadSystemNumber(false);
      }

      await loadOutcome(false);
    };

    syncState();

    return () => {
      cancelled = true;
    };
  }, [address, loadOutcome, loadSystemNumber, publicClient, refreshActiveRound]);

  return (
    <div className="numberwar-container">
      <div className="numberwar-card">
        <h2 className="card-title">Play NumberWar</h2>
        <p className="card-description">
          Join the encrypted duel, receive a hidden number between {MIN_VALUE} and {MAX_VALUE}, and submit your own
          encrypted guess. If the sum is even, you win the round.
        </p>

        <div className="status-banner">
          <span className={`status-dot ${activeRound ? 'status-active' : 'status-idle'}`} />
          <span>{activeRound ? 'Round in progress' : 'No active round'}</span>
        </div>

        <div className="actions-grid">
          <button
            className="primary-button"
            onClick={handleJoin}
            disabled={isJoining || isSubmitting || isZamaLoading || !address}
          >
            {isJoining ? 'Preparing...' : 'Join Game'}
          </button>

          <div className="input-group">
            <label htmlFor="player-number" className="input-label">
              Your number ({MIN_VALUE}-{MAX_VALUE})
            </label>
            <input
              id="player-number"
              type="number"
              min={MIN_VALUE}
              max={MAX_VALUE}
              value={playerNumber}
              onChange={(event) => setPlayerNumber(event.target.value)}
              className="number-input"
              disabled={isSubmitting || isJoining}
            />
          </div>

          <button
            className="secondary-button"
            onClick={handleSubmit}
            disabled={isSubmitting || isJoining || isZamaLoading || !activeRound}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Encrypted Number'}
          </button>
        </div>

        <div className="cipher-section">
          <div className="cipher-block">
            <div className="cipher-header">
              <h3 className="cipher-title">System Number</h3>
              <button
                className="link-button"
                onClick={handleDecryptSystemNumber}
                disabled={isDecrypting || !systemCiphertext || isZeroCiphertext(systemCiphertext)}
              >
                Decrypt
              </button>
            </div>
            <p className="cipher-text">
              {systemCiphertext ? systemCiphertext : 'Not available'}
            </p>
            <p className="cipher-note">
              {systemNumber !== null ? `Decrypted value: ${systemNumber}` : 'Decrypt to reveal the assigned number.'}
            </p>
          </div>

          <div className="cipher-block">
            <div className="cipher-header">
              <h3 className="cipher-title">Round Outcome</h3>
              <button
                className="link-button"
                onClick={handleDecryptOutcome}
                disabled={isDecrypting || !outcomeCiphertext || isZeroCiphertext(outcomeCiphertext)}
              >
                Decrypt
              </button>
            </div>
            <p className="cipher-text">
              {outcomeCiphertext ? outcomeCiphertext : 'Not available'}
            </p>
            <p className={`cipher-note ${roundOutcome === null ? '' : roundOutcome ? 'cipher-win' : 'cipher-loss'}`}>
              {roundOutcome === null ? 'Decrypt to discover if you won.' : roundOutcome ? 'You won the round!' : 'You lost this round.'}
            </p>
          </div>
        </div>

        {statusMessage && <div className="status-message">{statusMessage}</div>}

        {errorMessage && <div className="error-message">⚠️ {errorMessage}</div>}

        {isZamaLoading && <div className="info-message">Initializing Zama encryption services...</div>}

        {zamaError && !isZamaLoading && (
          <div className="error-message">⚠️ {zamaError}</div>
        )}

        {!address && <div className="info-message">Connect your wallet to begin.</div>}
      </div>
    </div>
  );
}
