# See: https://github.com/cloudflare/workerd?tab=readme-ov-file#configuring-workerd

using Workerd = import "/workerd/workerd.capnp";

const unitTests :Workerd.Config = (
  services = [
    # Define the service to be tested.
    (name = "main", worker = .testWorker),

    # Not required, but we can redefine the special "internet" service so that it disallows any
    # outgoing connections. This prohibits the test from talking to the network.
    (name = "internet", network = (allow = []))
  ],

  # For running tests, we do not need to define any sockets, since tests do not accept incoming
  # connections.
);

const testWorker :Workerd.Worker = (
  # Just a regular old worker definition.
  modules = [
    (name = "test", esModule = embed "./dist/vite-cloudlare/esm/test/workerd-ts.mjs"),
  ],
  compatibilityDate = "2025-07-06",
);
