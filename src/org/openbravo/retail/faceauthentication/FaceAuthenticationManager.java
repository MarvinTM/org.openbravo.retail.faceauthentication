package org.openbravo.retail.faceauthentication;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.hibernate.criterion.Restrictions;
import org.openbravo.authentication.AuthenticationException;
import org.openbravo.authentication.basic.DefaultAuthenticationManager;
import org.openbravo.base.exception.OBException;
import org.openbravo.base.secureApp.VariablesSecureApp;
import org.openbravo.dal.core.OBContext;
import org.openbravo.dal.service.OBCriteria;
import org.openbravo.dal.service.OBDal;
import org.openbravo.erpCommon.utility.OBError;
import org.openbravo.model.ad.access.User;

public class FaceAuthenticationManager extends DefaultAuthenticationManager {

  @Override
  protected String doAuthenticate(HttpServletRequest request, HttpServletResponse response)
      throws AuthenticationException, ServletException, IOException {

    final VariablesSecureApp vars = new VariablesSecureApp(request, false);

    String userName = vars.getStringParameter(LOGIN_PARAM);

    if (false && userName != null) {
      return super.doAuthenticate(request, response);
    }

    // String image = "";
    // String image =request.getHeader("image");

    String image = readImageFromRequest(vars);

    HttpClient httpClient = HttpClients.createDefault();
    HttpPost httpPost = new HttpPost("http://192.168.102.164:3000");

    JSONObject payload = new JSONObject();

    try {
      payload.put("image", image);
    } catch (JSONException e1) {
      // not needed
    }
    httpPost.setEntity(new StringEntity(payload.toString(), ContentType.APPLICATION_JSON));

    HttpResponse nodeResponse = httpClient.execute(httpPost);
    BufferedReader bufferedReader = new BufferedReader(
        new InputStreamReader(nodeResponse.getEntity().getContent()));

    StringBuffer content = new StringBuffer();
    String line = "";
    while ((line = bufferedReader.readLine()) != null) {
      content.append(line);
    }

    JSONObject responseObj = null;
    boolean success = true;
    String user = null;
    try {
      responseObj = new JSONObject(content.toString());
      success = responseObj.getBoolean("success");
      user = responseObj.getString("user");
    } catch (JSONException e) {
      // won't happen
    }

    if (success) {
      OBContext.setAdminMode(false);
      try {
        OBCriteria<User> userCriteria = OBDal.getInstance().createCriteria(User.class);
        userCriteria.add(Restrictions.eq("username", user));
        userCriteria.setFilterOnActive(false);
        userCriteria.setFilterOnReadableClients(false);
        userCriteria.setFilterOnReadableOrganization(false);
        User dalUser = (User) userCriteria.uniqueResult();
        if (dalUser == null) {
          throw new OBException("No user found: " + user);
        }
        String userId = dalUser.getId();

        final String sessionId = createDBSession(request, user, userId);

        vars.setSessionValue("#AD_User_ID", userId);

        request.getSession(true).setAttribute("#Authenticated_user", userId);

        vars.setSessionValue("#AD_SESSION_ID", sessionId);
        vars.setSessionValue("#LogginIn", "Y");

        return userId;
      } finally {
        OBContext.restorePreviousMode();
      }

    } else {
      OBError errorMsg = new OBError();
      errorMsg.setType("Error");
      errorMsg.setTitle("User not recognised");
      errorMsg.setMessage("User is not recognised. Please use standard authentication.");
      throw new AuthenticationException("IDENTIFICATION_FAILURE_TITLE", errorMsg, false);
    }

  }

  private String readImageFromRequest(VariablesSecureApp vars) {
    try {
      return vars.getInParameter("image");
    } catch (ServletException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    } finally {
      return "";
    }
  }

  private String readImage() throws ClientProtocolException, IOException {
    HttpClient httpClientImg = HttpClients.createDefault();
    HttpPost httpPostImg = new HttpPost("http://192.168.102.164:3000/img");
    HttpResponse nodeResponse = httpClientImg.execute(httpPostImg);
    BufferedReader bufferedReader = new BufferedReader(
        new InputStreamReader(nodeResponse.getEntity().getContent()));

    StringBuffer content = new StringBuffer();
    String line = "";
    while ((line = bufferedReader.readLine()) != null) {
      content.append(line);
    }

    return content.toString();

  }

}
