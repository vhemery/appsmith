package com.appsmith.git.helpers;

import com.appsmith.util.CryptoUtil;
import org.bouncycastle.crypto.params.AsymmetricKeyParameter;
import org.bouncycastle.crypto.util.OpenSSHPublicKeyUtil;
import org.bouncycastle.jcajce.spec.OpenSSHPublicKeySpec;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.eclipse.jgit.api.TransportConfigCallback;
import org.eclipse.jgit.transport.SshSessionFactory;
import org.eclipse.jgit.transport.SshTransport;
import org.eclipse.jgit.transport.Transport;
import org.eclipse.jgit.transport.sshd.SshdSessionFactory;

import java.io.File;
import java.io.IOException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.List;

/**
 * A custom TransportConfigCallback class that loads private key and public key from the provided strings in constructor.
 * An instance of this class will be used as follows:
 * <p>
 * TransportConfigCallback transportConfigCallback = new SshTransportConfigCallback(PVT_KEY_STRING, PUB_KEY_STRING);
 * Git.open(gitRepoDirFile) // gitRepoDirFile is an instance of File
 * .push()
 * .setTransportConfigCallback(transportConfigCallback)
 * .call();
 */
public class SshTransportConfigCallback implements TransportConfigCallback {
    private String privateKey;
    private String publicKey;

    public SshTransportConfigCallback(String privateKey, String publicKey) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
    }

    private final SshSessionFactory sshSessionFactory = new SshdSessionFactory() {

        @Override
        protected Iterable<KeyPair> getDefaultKeys(File sshDir) {

            try {
                KeyPair keyPair;

                if (publicKey.startsWith("ssh-rsa")) {
                    KeyFactory keyFactory = null;
                    keyFactory = KeyFactory.getInstance("RSA");

                    PublicKey generatedPublicKey =
                            keyFactory.generatePublic(CryptoUtil.decodeOpenSSH(publicKey.getBytes()));
                    PKCS8EncodedKeySpec privateKeySpec =
                            new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKey));
                    PrivateKey generatedPrivateKey = keyFactory.generatePrivate(privateKeySpec);
                    keyPair = new KeyPair(generatedPublicKey, generatedPrivateKey);
                } else {
                    KeyFactory keyFactory = KeyFactory.getInstance("ECDSA", new BouncyCastleProvider());
                    String[] fields = publicKey.split(" ");
                    AsymmetricKeyParameter keyParameter = OpenSSHPublicKeyUtil.parsePublicKey(
                            Base64.getDecoder().decode(fields[1].getBytes()));
                    OpenSSHPublicKeySpec keySpec =
                            new OpenSSHPublicKeySpec(OpenSSHPublicKeyUtil.encodePublicKey(keyParameter));
                    PublicKey generatedPublicKey = keyFactory.generatePublic(keySpec);
                    PKCS8EncodedKeySpec privateKeySpec =
                            new PKCS8EncodedKeySpec(Base64.getDecoder().decode(privateKey));
                    PrivateKey generatedPrivateKey = keyFactory.generatePrivate(privateKeySpec);
                    keyPair = new KeyPair(generatedPublicKey, generatedPrivateKey);
                }

                return List.of(keyPair);
            } catch (NoSuchAlgorithmException | InvalidKeySpecException | IOException e) {
                throw new RuntimeException(e);
            }
        }
    };

    @Override
    public void configure(Transport transport) {
        SshTransport sshTransport = (SshTransport) transport;
        sshTransport.setSshSessionFactory(sshSessionFactory);
    }
}
