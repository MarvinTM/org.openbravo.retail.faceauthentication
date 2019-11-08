package org.openbravo.retail.faceauthentication;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.enterprise.context.ApplicationScoped;

import org.openbravo.client.kernel.BaseComponentProvider;
import org.openbravo.client.kernel.Component;
import org.openbravo.client.kernel.ComponentProvider;
import org.openbravo.retail.posterminal.POSUtils;

@ApplicationScoped
@ComponentProvider.Qualifier(FaceAuthenticationComponentProvider.QUALIFIER)
public class FaceAuthenticationComponentProvider extends BaseComponentProvider {

  public static final String QUALIFIER = "FA";
  private static final String MODULE_JAVA_PACKAGE = "org.openbravo.retail.faceauthentication";

  @Override
  public Component getComponent(String componentId, Map<String, Object> parameters) {
    throw new IllegalArgumentException("Component id " + componentId + " not supported.");
  }

  @Override
  public List<ComponentResource> getGlobalComponentResources() {
    final List<ComponentResource> globalResources = new ArrayList<>();
    final String prefix = "web/" + MODULE_JAVA_PACKAGE + "/js/";

    final String[] resourceList = { "face-api", "faceapi-utils", "webcam-popup" ,"webcam-button"};

    for (String resource : resourceList) {
      globalResources.add(createComponentResource(ComponentResource.ComponentResourceType.Static,
          prefix + resource + ".js", POSUtils.APP_NAME));
    }

    return globalResources;
  }

}
