import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedNumberWar = await deploy("NumberWar", {
    from: deployer,
    log: true,
  });

  console.log(`NumberWar contract: `, deployedNumberWar.address);
};
export default func;
func.id = "deploy_numberWar"; // id required to prevent reexecution
func.tags = ["NumberWar"];
